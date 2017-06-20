import asap from "asap";
import { set, when } from "cerebral/operators";
import { state, props } from "cerebral/tags";
import { innerJoin, drop } from "ramda";
import { getId, getModulePath, getSignal } from "./util";

export function samStepFactory({
  prefix = "",
  accept,
  computeControlState,
  computeNextAction,
  controlState,
  allowedActions,
  actions,
}) {
  const prefixedPath = getModulePath(prefix);
  const GetId = getId();
  const ensureInitialSamState = [
    when(state`${prefixedPath("sam")}`),
    {
      true: [],
      false: [
        set(state`${prefixedPath("sam")}`, {
          prefix,
          init: true,
          stepId: GetId.next().value,
          controlState: { name: controlState, allowedActions },
          proposeInProgress: false,
          acceptInProgress: false,
          napInProgress: false,
          syncNap: true,
        }),
      ],
    },
  ];

  const stepActionsFactory = action => ({
    guardDisallowedAction: when(
      state`${prefixedPath("sam.controlState")}`,
      state`${prefixedPath("sam.init")}`,
      props`_browserInit`,
      (controlState, init, browserInit) => {
        const actions = action.name.split(",");
        const commonActionsSet = innerJoin(
          (allowed, actionName) => allowed === actionName,
          controlState.allowedActions,
          actions,
        );
        return (
          !controlState.name ||
          (init && browserInit) ||
          commonActionsSet.length === actions.length
        );
      },
    ),

    logDisallowedAction({ state, props }) {
      const { controlState, stepId } = state.get(prefixedPath("sam"));
      console.info(
        `Disallowed action [${prefixedPath(
          action.name,
        )}] blocked in control-state [${controlState.name}] in step-ID [${stepId}]. Props:`,
        props,
      );
    },

    // TODO: If NAP is allowed on server, this check should be changed.
    setIsInitialSignal: [
      when(
        state`${prefixedPath("sam.init")}`,
        props`_browserInit`,
        (init, browserInit) => init && browserInit,
      ),
      {
        false: [],
        true: [set(state`${prefixedPath("sam.init")}`, false)],
      },
    ],

    logPossibleInterrupt: [
      when(
        state`${prefixedPath("sam.proposeInProgress")}`,
        state`${prefixedPath("sam.napInProgress")}`,
        state`${prefixedPath("sam.syncNap")}`,
        (proposeInProgress, napInProgress, syncNap) =>
          proposeInProgress || (proposeInProgress && napInProgress && !syncNap),
      ),
      {
        false: [],
        true: [
          function logPossibleInterrupt({ state, props }) {
            const { proposeInProgress, stepId } = state.get(
              prefixedPath("sam"),
            );
            console.info(
              `Possible cancelation by action [${prefixedPath(
                action.name,
              )}] for pending action [${prefixedPath(
                proposeInProgress,
              )}] in step-ID [${stepId}]. Props:`,
              props,
            );
          },
        ],
      },
    ],

    guardSignalInterrupt: when(
      props`_isNap`,
      state`${prefixedPath("sam.acceptInProgress")}`,
      state`${prefixedPath("sam.napInProgress")}`,
      state`${prefixedPath("sam.syncNap")}`,
      (isNap, acceptInProgress, napInProgress, syncNap) =>
        isNap || !(acceptInProgress || (napInProgress && syncNap)),
    ),

    logInterruptFailed({ state, props }) {
      const {
        napInProgress,
        acceptInProgress,
        controlState,
        stepId,
      } = state.get(prefixedPath("sam"));
      const progressMsg = napInProgress
        ? `synchronous automatic action [${prefixedPath(
            napInProgress,
          )}] (NAP) for control-state [${controlState.name}]`
        : `accept for action [${acceptInProgress}]`;
      console.info(
        `Blocked action [${prefixedPath(
          action.name,
        )}], ${progressMsg} in progress in step-ID [${stepId}]. Props:`,
        props,
      );
    },

    getProposal(input) {
      return action.tree
        ? do {
            let args = [action.name, action.tree, input.props];
            if (input.controller.constructor.name === "UniversalController") {
              args = drop(1, args);
            }
            input.controller.run(...args); // This shows up as separate signal in the debugger.
          }
        : action(input) || {};
    },

    guardStaleProposal: when(
      state`${prefixedPath("sam.init")}`,
      state`${prefixedPath("sam.stepId")}`,
      props`_stepId`,
      (init, stepId, actionStepId) => init || stepId === actionStepId,
    ),

    logStaleProposal({ state, props }) {
      console.info(
        `Canceled (stale) proposal from action [${prefixedPath(
          action.name,
        )}] in step-ID [${state.get(prefixedPath("sam.stepId"))}]. Props:`,
        props,
      );
    },

    incrementStepId({ state }) {
      state.set(prefixedPath("sam.stepId"), GetId.next().value);
    },

    setControlState({ state }) {
      const states = computeControlState(state.get()) || [];
      if (states.length < 1) throw new Error("Invalid control state.");

      const [[name, allowedActions]] = mergeControlStates(states);

      state.set(prefixedPath("sam.controlState"), { name, allowedActions });
    },

    getNextAction({ state }) {
      const controlStateName = state.get(prefixedPath("sam.controlState.name"));
      const [nextActions, allowNapInterrupt = false] = computeNextAction(
        controlStateName,
      ) || [[]];

      if (!Array.isArray(nextActions)) {
        throw new Error(`Invalid NAP after action [${action.name}]`);
      }

      return { nextActions, _syncNap: !allowNapInterrupt };
    },

    emitNapDone({ controller }) {
      controller.emit(`napDone${prefix ? `-${prefix}` : ""}`);
    },

    setNapInprogress({ props, state }) {
      state.set(
        prefixedPath("sam.napInProgress"),
        props.nextActions.map(([name]) => name).join(","),
      );
    },

    runNextAction({ props, controller }) {
      const { nextActions } = props;
      const napProp = { _isNap: true }; // TODO: Secure this

      let args;
      if (nextActions.length === 1) {
        const [signalName, signalInput = {}] = nextActions[0];
        const signal = getSignal(controller, prefixedPath(signalName));
        args = [signalName, signal, { ...signalInput, ...napProp }];
      } else {
        const [[compoundName, proposalPromises]] = mergeActions(
          actions,
          nextActions,
        );
        const compoundAction = Object.defineProperty(
          async () => {
            const proposals = await Promise.all(proposalPromises);
            return [...proposals, napProp].reduce(
              (acc, proposal) => ({ ...acc, ...proposal }),
              {},
            );
          },
          "name",
          { value: compoundName },
        );
        const { signal } = samStep(compoundAction);
        args = [compoundName, signal, napProp];
      }

      if (controller.constructor.name === "UniversalController") {
        args = drop(1, args);
      }
      asap(() => {
        controller.run(...args);
      });
    },
  });

  return samStep;

  function samStep(action) {
    if (Array.isArray(action)) {
      const [name, tree] = action;
      action = { name, tree };
    } else if (!action.name.length) {
      throw new Error(
        "Action must have a name. Provide a named function or an array ([name, [functionTree]])",
      );
    }

    const {
      guardDisallowedAction,
      logDisallowedAction,
      setIsInitialSignal,
      logPossibleInterrupt,
      guardSignalInterrupt,
      logInterruptFailed,
      getProposal,
      guardStaleProposal,
      logStaleProposal,
      incrementStepId,
      setControlState,
      getNextAction,
      emitNapDone,
      setNapInprogress,
      runNextAction,
    } = stepActionsFactory(action);

    return {
      signal: [
        ...ensureInitialSamState,
        guardDisallowedAction,
        {
          false: [logDisallowedAction],
          true: [
            ...setIsInitialSignal,
            ...logPossibleInterrupt, // If GUI allows clicks while model's accept or NAP are in progress, log an info.
            guardSignalInterrupt,
            {
              false: [logInterruptFailed],
              true: [
                set(
                  state`${prefixedPath("sam.proposeInProgress")}`,
                  action.name,
                ),
                set(props`_stepId`, state`${prefixedPath("sam.stepId")}`),
                getProposal,
                guardStaleProposal,
                {
                  false: [logStaleProposal],
                  true: [
                    set(state`${prefixedPath("sam.proposeInProgress")}`, false),
                    set(
                      state`${prefixedPath("sam.acceptInProgress")}`,
                      action.name,
                    ),
                    incrementStepId,
                    accept,
                    set(state`${prefixedPath("sam.acceptInProgress")}`, false),
                    setControlState,
                    getNextAction,
                    set(state`${prefixedPath("sam.napInProgress")}`, false),
                    when(props`nextActions`, nextActions => nextActions.length),
                    {
                      false: [emitNapDone], // Defer server until render after NAP is complete.
                      true: [
                        set(
                          state`${prefixedPath("sam.syncNap")}`,
                          props`_syncNap`,
                        ),
                        setNapInprogress,
                        runNextAction,
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      catch: new Map([
        [
          Error,
          [
            ({ props: { error } }) => {
              console.error("SAM step catched an error", error);
            },
          ],
        ],
      ]),
    };
  }
}

const mergeControlStates = states =>
  states
    .reduce(
      ([[nameSet, allowedActionsSet]], [name, allowedActions]) => {
        nameSet.add(name);
        allowedActions.forEach(::allowedActionsSet.add);
        return [[nameSet, allowedActionsSet]];
      },
      [[new Set(), new Set()]],
    )
    .map(([nameSet, allowedActionsSet]) => [
      [...nameSet.values()].join(","),
      [...allowedActionsSet.values()],
    ]);

const mergeActions = (actions, nextActions) =>
  nextActions
    .reduce(
      (
        [[compoundNameSet, proposalPromises]],
        [signalName, signalInput = {}],
      ) => {
        compoundNameSet.add(signalName);
        proposalPromises.push(
          Promise.resolve(actions[signalName]({ props: signalInput })),
        );
        return [[compoundNameSet, proposalPromises]];
      },
      [[new Set(), []]],
    )
    .map(([compoundNameSet, proposalPromises]) => [
      [...compoundNameSet.values()].join(","),
      proposalPromises,
    ]);
