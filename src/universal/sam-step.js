import asap from "asap";
import { set, when } from "cerebral/operators";
import { state, props } from "cerebral/tags";
import FunctionTree from "function-tree";
import { getId, getModulePath } from "./util";

export function samStepFactory({
  prefix = "",
  accept,
  computeControlState,
  computeNextAction,
  controlState,
  allowedActions,
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
        }),
      ],
    },
  ];

  return function samStep(action) {
    action = parseAction(action);

    if (!action) {
      throw new Error(
        "Action must have a name. Provide a named function or an array ([name, [functionTree]])",
      );
    }

    const guardDisallowedAction = when(
      state`${prefixedPath("sam.controlState")}`,
      state`${prefixedPath("sam.init")}`,
      props`_browserInit`,
      (controlState, init, browserInit) =>
        (init && browserInit) ||
        !controlState.name ||
        controlState.allowedActions.includes(action.name),
    );

    const logDisallowedAction = ({ state, props }) => {
      const { controlState, stepId } = state.get(prefixedPath("sam"));
      console.info(
        `Disallowed action [${prefixedPath(
          action.name,
        )}] blocked in control-state [${controlState.name}] in step-ID [${stepId}]. Props:`,
        props,
      );
    };

    // TODO: If NAP is allowed on server, this check should be changed.
    const setIsInitialSignal = [
      when(
        state`${prefixedPath("sam.init")}`,
        props`_browserInit`,
        (init, browserInit) => init && browserInit,
      ),
      {
        false: [],
        true: [set(state`${prefixedPath("sam.init")}`, false)],
      },
    ];

    const logPossibleInterrupt = [
      when(
        state`${prefixedPath("sam.proposeInProgress")}`,
        state`${prefixedPath("sam.napInProgress")}`,
        (proposeInProgress, napInProgress) =>
          proposeInProgress && !napInProgress,
      ),
      {
        false: [],
        true: [
          ({ state, props }) => {
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
    ];

    const guardSignalInterrupt = when(
      state`${prefixedPath("sam.napInProgress")}`,
      state`${prefixedPath("sam.acceptInProgress")}`,
      props`_isNap`,
      (napInProgress, acceptInProgress, isNap) =>
        (!napInProgress && !acceptInProgress) || isNap,
    );

    const logInterruptFailed = ({ state, props }) => {
      const {
        napInProgress,
        acceptInProgress,
        controlState,
        stepId,
      } = state.get(prefixedPath("sam"));
      const progressMsg = napInProgress
        ? `automatic (NAP) action [${prefixedPath(
            napInProgress,
          )}] for control-state [${controlState.name}]`
        : `accept for action [${acceptInProgress}]`;
      console.info(
        `Blocked action [${prefixedPath(
          action.name,
        )}], ${progressMsg} in progress in step-ID [${stepId}]. Props:`,
        props,
      );
    };

    const getProposal = input =>
      action.tree
        ? new FunctionTree().run(action.name, action.tree, input.props)
        : action(input) || {};

    const guardStaleProposal = when(
      state`${prefixedPath("sam.init")}`,
      state`${prefixedPath("sam.stepId")}`,
      props`_stepId`,
      (init, stepId, actionStepId) => init || stepId === actionStepId,
    );

    const logStaleProposal = ({ state, props }) => {
      console.info(
        `Canceled (stale) proposal from action [${prefixedPath(
          action.name,
        )}] in step-ID [${state.get(prefixedPath("sam.stepId"))}]. Props:`,
        props,
      );
    };

    const incrementStepId = ({ state }) => {
      state.set(prefixedPath("sam.stepId"), GetId.next().value);
    };

    const setControlState = ({ state }) => {
      const states = computeControlState(state.get()) || [];
      if (states.length < 1) throw new Error("Invalid control state.");

      const [[name, allowedActions]] = states
        .reduce(
          ([[nameSet, allowedActionsSet]], [name, allowedActions]) => {
            nameSet.add(name);
            allowedActions.forEach(::allowedActionsSet.add);
            return [[nameSet, allowedActionsSet]];
          },
          [[new Set(), new Set()]],
        )
        .map(([nameSet, allowedActionsSet]) => [
          [...nameSet.values()].join(),
          [...allowedActionsSet.values()],
        ]);

      state.set(prefixedPath("sam.controlState"), { name, allowedActions });
    };

    const getNextAction = ({ state }) => {
      const nextAction = computeNextAction(
        state.get(prefixedPath("sam.controlState.name")),
      );
      const [signalPath, signalInput] = nextAction || [];
      return { signalPath, signalInput };
    };

    const emitNapDone = ({ controller }) => {
      controller.emit(`napDone${prefix ? `-${prefix}` : ""}`);
    };

    const runNextAction = ({ state, props, controller }) => {
      asap(() => {
        const signalInput = {
          ...props.signalInput,
          _isNap: true, // TODO: Secure this
        };
        const signalPath = prefixedPath(props.signalPath);
        state.set(prefixedPath("sam.napInProgress"), signalPath);

        if (controller.constructor.name === "UniversalController") {
          const signal = prefix
            ? controller.module.modules[prefix].signals[props.signalPath]
            : controller.module.signals[props.signalPath].signal;
          controller.run(signal, signalInput);
        } else {
          controller.getSignal(signalPath)(signalInput);
        }
      });
    };

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
                    when(props`signalPath`),
                    {
                      false: [
                        set(state`${prefixedPath("sam.napInProgress")}`, false),
                        emitNapDone, // Defer server render after NAP is complete.
                      ],
                      true: [runNextAction],
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
  };
}

function parseAction(action) {
  if (Array.isArray(action)) {
    const [name, tree] = action;
    action = { name, tree };
  } else if (
    Object.prototype.toString.call(action) !== "[object Function]" ||
    !action.name.length
  ) {
    action = null;
  }
  return action;
}
