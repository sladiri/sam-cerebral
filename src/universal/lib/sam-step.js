import { set, when } from "cerebral/operators";
import { state, props } from "cerebral/tags";
import FunctionTree from "function-tree";
import { getId, getModulePath } from "../lib/util";

export function samStepFactory({
  prefix,
  propose,
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
      false: [
        set(state`${prefixedPath("sam")}`, {
          init: true,
          stepId: GetId.next().value,
          controlState: { name: controlState, allowedActions },
          proposeInProgress: false,
          acceptInProgress: false,
          napInProgress: false,
        }),
      ],
      true: [set(state`${prefixedPath("sam.init")}`, false)],
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
      controlState =>
        !controlState.name || controlState.allowedActions.includes(action.name),
    );

    const logDisallowedAction = ({ state, props }) => {
      const { controlState, stepId } = state.get(prefixedPath("sam"));
      console.warn(
        `Disallowed action [${prefixedPath(
          action.name,
        )}] blocked in control-state [${controlState.name}] in step-ID [${stepId}]. Props:`,
        props,
      );
    };

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
            console.warn(
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
      // If GUI allows clicks while model's propose or NAP is in progress, log a warning.
      const {
        napInProgress,
        controlState,
        proposeInProgress,
        stepId,
      } = state.get(prefixedPath("sam"));
      const progressMsg = napInProgress
        ? `automatic (NAP) action [${prefixedPath(
            napInProgress,
          )}] for control-state [${controlState.name}]`
        : `accept for action [${prefixedPath(proposeInProgress)}]`;
      console.warn(
        `Blocked action [${prefixedPath(
          action.name,
        )}], ${progressMsg} in progress in step-ID [${stepId}]. Props:`,
        props,
      );
    };

    const getProposal = ({ props }) =>
      action.tree
        ? new Promise(resolve => {
            new FunctionTree()(
              action.tree,
              props,
              (self, execution, payload = {}) => {
                resolve(payload);
              },
            );
          })
        : action({ input: props }) || {};

    const guardStaleAction = when(
      state`${prefixedPath("sam.init")}`,
      state`${prefixedPath("sam.stepId")}`,
      props`_stepId`,
      (init, stepId, actionStepId) => init || stepId === actionStepId,
    );

    const logStaleAction = ({ state, props }) => {
      console.warn(
        `Canceled (stale) action [${prefixedPath(
          action.name,
        )}] in step-ID [${state.get(prefixedPath("sam.stepId"))}]. Props:`,
        props,
      );
    };

    const incrementStepId = ({ state }) => {
      state.set(prefixedPath("sam.stepId"), GetId.next().value);
    };

    const setControlState = ({ state }) => {
      const [name, allowedActions] = computeControlState(state.get()) || [];
      if (!name) {
        throw new Error("Invalid control state name.");
      }
      state.set(prefixedPath("sam.controlState"), { name, allowedActions });
    };

    const getNextAction = ({ state }) => {
      const [signalPath = false, signalInput, blockStep = false] =
        computeNextAction(state.get(prefixedPath("sam.controlState.name"))) ||
        [];

      return {
        signalPath,
        signalInput,
        blockStep,
      };
    };

    return {
      signal: [
        ...ensureInitialSamState,
        guardDisallowedAction,
        {
          false: [logDisallowedAction],
          true: [
            ...logPossibleInterrupt,
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
                guardStaleAction,
                {
                  false: [logStaleAction],
                  true: [
                    incrementStepId,
                    set(state`${prefixedPath("sam.acceptInProgress")}`, true),
                    propose,
                    setControlState,
                    getNextAction,
                    set(state`${prefixedPath("sam.proposeInProgress")}`, false),
                    set(
                      state`${prefixedPath("sam.napInProgress")}`,
                      props`signalPath`,
                    ),
                    // TODO: Check if blockStep is useful.
                    set(
                      state`${prefixedPath("sam.acceptInProgress")}`,
                      props`blockStep`,
                    ),
                    when(props`signalPath`),
                    {
                      false: [],
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

function runNextAction({ props, controller }) {
  setImmediate(() => {
    const { signalPath, signalInput } = props;
    const samStep = controller.module.signals[signalPath];
    try {
      controller.runSignal(signalPath, samStep.signal, {
        ...signalInput,
        _isNap: true, // TODO: Secure this
      });
    } catch (error) {
      controller.runSignal(signalPath, Array.from(samStep.catch.values()), {
        error,
      });
    }
  });
}
