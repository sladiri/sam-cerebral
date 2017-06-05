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
  const GetId = getId();
  const stepId = GetId.next().value;

  return function samStep(action) {
    action = handleActionTree(action);

    if (!action) {
      throw new Error(
        "Action must have a name. Provide a named function or an array ([name, [functionTree]])",
      );
    }

    return {
      signal: [
        ...ensureSamStateFactory(prefix, stepId, controlState, allowedActions),
        guardDisallowedActionFactory(action.name, prefix),
        {
          false: [logDisallowedActionFactory(action.name, prefix)],
          true: [
            ...logPossibleInterruptFactory(action.name, prefix),
            guardSignalInterruptFactory(prefix),
            {
              false: logInterruptFailedFactory(action.name, prefix),
              true: [
                set(
                  state`${getModulePath(prefix, "sam.proposeInProgress")}`,
                  action.name,
                ),
                set(
                  props`_stepId`,
                  state`${getModulePath(prefix, "sam.stepId")}`,
                ),
                getProposalFactory(action),
                guardStaleActionFactory(prefix),
                {
                  false: [logStaleActionFactory(action.name, prefix)],
                  true: [
                    incrementStepIdFactory(GetId, prefix),
                    set(
                      state`${getModulePath(
                        prefix,
                        "sam.acceptAndNapInProgress",
                      )}`,
                      true,
                    ),
                    function proposeProposal(input) {
                      return propose(input);
                    },
                    getControlStateFactory(computeControlState),
                    when(
                      props`controlState.name`,
                      controlStateName => !!controlStateName,
                    ),
                    {
                      false: [
                        () => {
                          throw new Error("Invalid control state.");
                        },
                      ],
                      true: [
                        set(
                          state`${getModulePath(prefix, "sam.controlState")}`,
                          props`controlState`,
                        ),
                        getNextActionFactory(computeNextAction),
                        ({ state, props }) => {
                          state.set(
                            getModulePath(prefix, "sam.proposeInProgress"),
                            false,
                          );
                          state.set(
                            getModulePath(prefix, "sam.napInProgress"),
                            props.signalPath,
                          );
                          // TODO: Check if blockStep is useful.
                          state.set(
                            getModulePath(prefix, "sam.acceptAndNapInProgress"),
                            props.blockStep,
                          );
                        },
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

export const handleActionTree = action => {
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
};

export const ensureSamStateFactory = (
  prefix,
  stepId,
  controlState,
  allowedActions,
) => [
  when(state`${getModulePath(prefix, "sam")}`),
  {
    false: [
      set(
        state`${getModulePath(prefix, "sam")}`,
        samStateFactory(stepId, controlState, allowedActions),
      ),
    ],
    true: [set(state`${getModulePath(prefix, "sam.init")}`, false)],
  },
];

export const samStateFactory = (stepId, controlState, allowedActions) => ({
  init: true,
  stepId,
  controlState: { name: controlState, allowedActions },
  proposeInProgress: false,
  acceptAndNapInProgress: false,
  napInProgress: false,
});

export const logPossibleInterruptFactory = (actionName, prefix) => [
  when(
    state`${getModulePath(prefix, "sam.proposeInProgress")}`,
    state`${getModulePath(prefix, "sam.napInProgress")}`,
    props`_isNap`,
    (proposeInProgress, napInProgress, isNap) =>
      proposeInProgress && !isNap && !napInProgress,
  ),
  {
    false: [],
    true: [
      ({ state, props }) => {
        const sam = state.get(getModulePath(prefix, "sam"));
        console.warn(
          `Possible cancelation by action [${getPrefixedPath(
            prefix,
            actionName,
          )}] for pending action [${getPrefixedPath(
            prefix,
            sam.proposeInProgress,
          )}] in step-ID [${sam.stepId}]. Props:`,
          props,
        );
      },
    ],
  },
];

export const guardSignalInterruptFactory = prefix =>
  when(
    state`${getModulePath(prefix, "sam.napInProgress")}`,
    state`${getModulePath(prefix, "sam.acceptAndNapInProgress")}`,
    props`_isNap`,
    (napInProgress, acceptAndNapInProgress, isNap) =>
      (!napInProgress && !acceptAndNapInProgress) || isNap,
  );

export const logInterruptFailedFactory = (actionName, prefix) => [
  ({ state, props }) => {
    // If GUI allows clicks while model's propose or NAP is in progress, log a warning.
    const sam = state.get(getModulePath(prefix, "sam"));
    const progressMsg = sam.napInProgress
      ? `automatic (NAP) action [${getPrefixedPath(
          prefix,
          sam.napInProgress,
        )}] for control-state [${sam.controlState.name}]`
      : `accept and NAP for action [${getPrefixedPath(
          prefix,
          sam.proposeInProgress,
        )}]`;
    console.warn(
      `Blocked action [${getPrefixedPath(
        prefix,
        actionName,
      )}], ${progressMsg} in progress in step-ID [${sam.stepId}]. Props:`,
      props,
    );
  },
];

export const guardDisallowedActionFactory = (actionName, prefix) =>
  when(
    state`${getModulePath(prefix, "sam.controlState")}`,
    controlState =>
      !controlState.name || controlState.allowedActions.includes(actionName),
  );

export const logDisallowedActionFactory = (actionName, prefix) => ({
  state,
  props,
}) => {
  const sam = state.get(getModulePath(prefix, "sam"));
  console.warn(
    `Disallowed action [${getPrefixedPath(
      prefix,
      actionName,
    )}] blocked in control-state [${sam.controlState
      .name}] in step-ID [${sam.stepId}]. Props:`,
    props,
  );
};

export const guardStaleActionFactory = prefix =>
  when(
    state`${getModulePath(prefix, "sam.init")}`,
    state`${getModulePath(prefix, "sam.stepId")}`,
    props`_stepId`,
    (init, stepId, actionStepId) => init || stepId === actionStepId,
  );

export const logStaleActionFactory = (actionName, prefix) => ({
  state,
  props,
}) => {
  console.warn(
    `Canceled action [${getPrefixedPath(
      prefix,
      actionName,
    )}] in step-ID [${state.get(getModulePath(prefix, "sam.stepId"))}]. Props:`,
    props,
  );
};

export const incrementStepIdFactory = (generator, prefix) =>
  function setStepId({ state }) {
    state.set(getModulePath(prefix, "sam.stepId"), generator.next().value);
  };

export const getProposalFactory = action =>
  function getProposal({ props }) {
    return action.tree
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
  };

export const getControlStateFactory = computeControlState =>
  function getControlState({ state }) {
    const [name, allowedActions] = computeControlState(state.get());
    return { controlState: { name, allowedActions } };
  };

export const getNextActionFactory = (computeNextAction, prefix) =>
  function getNextAction({ state }) {
    const [signalPath = false, signalInput, blockStep = false] =
      computeNextAction(
        state.get(getModulePath(prefix, "sam.controlState.name")),
      ) || [];

    return {
      signalPath,
      signalInput,
      blockStep,
    };
  };

export function runNextAction({ props, controller }) {
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

export const getPrefixedPath = (prefix, path) =>
  prefix ? `${prefix}.${path}` : path;
