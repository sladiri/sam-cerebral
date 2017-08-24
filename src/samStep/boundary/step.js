import { innerJoin, memoize, omit, pickBy, type, curry } from "ramda";

import { getId, getModulePath } from "../../util/control";

export const waitForNap = curry(
  (controller, prefix, [sequence, payload] = []) => {
    const napDone = new Promise((resolve, reject) => {
      try {
        controller.once(`napDone${prefix ? `-${prefix}` : ""}`, resolve);
      } catch (error) {
        reject(error);
      }
    });

    if (sequence) {
      const signalPath = getModulePath(prefix, sequence);
      const signal = controller.getSignal(signalPath);
      signal(payload);
    }

    return napDone;
  },
);

export const samStepProviderFactory = () => {
  let cachedProvider;
  return context => {
    if (!cachedProvider) {
      cachedProvider = waitForNap(context.controller);
    }
    context.samStep = cachedProvider;
    return context;
  };
};

const parseAction = action => {
  if (Array.isArray(action)) {
    const [name, tree] = action;
    action = { name, tree };
  }

  if (!action.name) {
    console.log("action", action);
    throw new Error(
      "Action must have a name. Provide a named function or an array ([name, [functionTree]])",
    );
  }
  return [action, action.name];
};

const getPrefixedStateProxy = prefixedPath =>
  memoize((state, scoped) =>
    Object.keys(state).reduce((acc, key) => {
      acc[key] = (statePath, ...args) => {
        statePath = prefixedPath(statePath);
        if (statePath === "") statePath = undefined;
        let result = state[key](statePath, ...args);
        if (type(result) === "Object" && scoped && result) {
          result = pickBy((val, key) => {
            const field = result[key];
            return !type(field) !== "Object" || field._prefix === undefined;
          }, result);
          result = omit(["_sam", "_hidden", "_prefix"], result);
        }
        return result;
      };
      return acc;
    }, {}),
  );

const getProposal = async ({
  action,
  actionName,
  props,
  controller,
  ...services
}) => {
  const proposal = await (action.tree
    ? controller.run(actionName, action.tree, props)
    : action({ controller, props, ...services }));

  return proposal !== undefined && Object.keys(proposal).length > 0
    ? proposal
    : { _abortAction: true };
};

/**
 * Emit NAP done
 * @param {string} prefix
 * @param {object} options
 * @param {object} options.controller
 * @param {object} options.payload - For inter-SAM-container communication pass e.g. state
 */
const emitNapDone = prefix => ({ controller, payload }) => {
  controller.emit(`napDone${prefix ? `-${prefix}` : ""}`, payload);
};

const mergeControlStates = states => {
  return states
    .reduce(
      ([[nameSet, allowedActionsSet]], [name, allowedActions = []]) => {
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
};

const mergeActions = ({ controller, actions, nextActions }) => {
  return nextActions
    .reduce(
      (
        [[compoundNameSet, proposalPromises]],
        [signalName, signalInput = {}],
      ) => {
        compoundNameSet.add(signalName);
        const [action, actionName] = parseAction(actions[signalName]);
        const proposal = getProposal({
          action,
          actionName,
          signalInput,
          controller,
        });
        proposalPromises.push(proposal);
        return [[compoundNameSet, proposalPromises]];
      },
      [[new Set(), []]],
    )
    .map(([compoundNameSet, proposalPromises]) => [
      [...compoundNameSet.values()].join(","),
      proposalPromises,
    ]);
};

const getCompoundSignal = (compoundName, proposalPromises, props) => {
  return Object.defineProperty(
    async () => {
      const proposals = await Promise.all(proposalPromises);
      return [...proposals, props].reduce(
        (acc, proposal) => ({ ...acc, ...proposal }),
        {},
      );
    },
    "name",
    { value: compoundName },
  );
};

const getModuleName = name => (name === "" ? "root" : name);

export const samFactory = ({
  prefix = "", // Cannot save undefined to state
  accept = () => {},
  computeStateRepresentation = () => ["default"],
  computeNextAction = () => [],
  actions = {},
  preventCompoundState = true,
  queueActions = false,
}) => {
  const prefixedPath = getModulePath(prefix);
  const prefixedStateProxy = getPrefixedStateProxy(prefixedPath);

  const _GetId = getId(); // Reuse this for automatic next-actions.

  const signals = Object.keys(actions).reduce((acc, key) => {
    acc[key] = [samStepFactory(actions[key])];
    return acc;
  }, {});

  const actionQueue = [];

  return { signals };

  function samStepFactory(_action, GetId = _GetId) {
    const [action, actionName] = parseAction(_action);

    return samStep;

    async function samStep(input) {
      try {
        const { state: _state, controller, props, ...services } = input;

        const state = prefixedStateProxy(_state);
        const entityState = prefixedStateProxy(_state, true);

        if (state.get("_sam.stepId") === undefined) {
          state.set("_sam", {
            prefix,
            stepId: GetId.next().value,
            init: true,
            controlState: { name: "", allowedActions: [] },
            proposeInProgress: false,
            acceptInProgress: false,
            napInProgress: false,
            queueActions,
          });
        }

        if (!guardDisallowedAction(state.get("_sam"))) {
          logDisallowedAction(props, state.get("_sam"));
          emitNapDone(prefix)({
            controller,
            payload: { ...entityState.get(), disallowed: true },
          });
          return;
        }

        logPossibleInterrupt(props, state.get("_sam"));

        if (!guardSignalInterrupt(props, state.get("_sam"))) {
          if (queueActions) {
            logActionQueued(actionName, props, state.get("_sam"));
            actionQueue.push([actionName, props]);
          } else {
            logInterruptFailed(props, state.get("_sam"));
            emitNapDone(prefix)({
              controller,
              payload: { ...entityState.get(), interrupted: true },
            });
          }
          return;
        }

        state.set("_sam.proposeInProgress", actionName);
        const stepId = state.get("_sam.stepId");
        const { _abortAction, ...proposal } = await getProposal({
          action,
          actionName,
          props,
          controller,
          ...services,
        });

        if (!guardEmptyProposal(_abortAction, state.get("_sam"))) {
          logEmptyProposal(state.get("_sam"));
          state.set("_sam.proposeInProgress", false);
          emitNapDone(prefix)({
            controller,
            payload: { ...entityState.get(), empty: true },
          });
          return;
        }

        if (!guardStaleProposal(stepId, state.get("_sam"))) {
          logStaleProposal(props, state.get("_sam"));
          return;
        }

        if (state.get("_sam.init")) {
          state.set("_sam.init", false);
        }

        state.set("_sam.proposeInProgress", false);
        state.set("_sam.acceptInProgress", actionName);
        state.set("_sam.stepId", GetId.next().value);
        await accept({
          state: entityState,
          props: proposal,
          ...services,
        });
        state.set("_sam.acceptInProgress", false);
        state.set("_sam.controlState", getControlState(entityState));

        const nextActions = getNextAction(state.get("_sam"), entityState.get());

        if (!nextActions.length) {
          if (!actionQueue.length) {
            state.set("_sam.napInProgress", false);
            emitNapDone(prefix)({ controller, payload: entityState.get() });
            return;
          } else {
            const [actionName, props] = actionQueue.pop();
            nextActions.push([actionName, props]);
          }
        }

        state.set(
          "_sam.napInProgress",
          nextActions.map(([name]) => name).join(","),
        );

        await runNextAction({ controller, nextActions });
      } catch (error) {
        console.error(
          `${getModuleName(prefix)} - SAM step catched an error`,
          error,
        );
      }
    }

    function guardDisallowedAction(sam) {
      if (sam.init) return true;

      const actions = actionName.split(",");
      const commonActionsSet = innerJoin(
        (allowed, actionName) => allowed === actionName,
        sam.controlState.allowedActions,
        actions,
      );
      return commonActionsSet.length === actions.length;
    }

    function logDisallowedAction(props, sam) {
      const { controlState, stepId } = sam;
      console.info(
        `${getModuleName(prefix)} - Disallowed action [${prefixedPath(
          actionName,
        )}] blocked in control-state [${controlState.name}] in step-ID [${stepId}]. Props:`,
        props,
      );
    }

    function logPossibleInterrupt(props, sam) {
      const { proposeInProgress, napInProgress, stepId } = sam;
      if (!props._isNap && (proposeInProgress || napInProgress)) {
        console.info(
          `${getModuleName(
            prefix,
          )} - Possible cancelation by action [${prefixedPath(
            actionName,
          )}] for pending action [${prefixedPath(
            proposeInProgress,
          )}] in step-ID [${stepId}]. Props:`,
          props,
        );
      }
    }

    function guardSignalInterrupt(props, sam) {
      const { acceptInProgress, napInProgress } = sam;
      return props._isNap || (!acceptInProgress && !napInProgress);
    }

    function logActionQueued(actionName, props, sam) {
      const { stepId } = sam;
      console.info(
        `${getModuleName(prefix)} - Queued action [${prefixedPath(
          actionName,
        )}] in step-ID [${stepId}]. Props:`,
        props,
      );
    }

    function logInterruptFailed(props, sam) {
      const { napInProgress, acceptInProgress, controlState, stepId } = sam;
      const progressMsg = napInProgress
        ? `synchronous automatic action [${prefixedPath(
            napInProgress,
          )}] (NAP) for control-state [${controlState.name}]`
        : `accept for action [${acceptInProgress}]`;
      console.info(
        `${getModuleName(prefix)} - Blocked action [${prefixedPath(
          actionName,
        )}], ${progressMsg} in progress in step-ID [${stepId}]. Props:`,
        props,
      );
    }

    function guardEmptyProposal(abortAction, sam) {
      return sam.init || !abortAction;
    }

    function logEmptyProposal(sam) {
      console.info(
        `${getModuleName(
          prefix,
        )} - Aborted empty proposal from action [${prefixedPath(
          actionName,
        )}] in step-ID [${sam.stepId}].`,
      );
    }

    function guardStaleProposal(actionStepId, sam) {
      const { init, stepId } = sam;
      return init || stepId === actionStepId;
    }

    function logStaleProposal(props, sam) {
      console.info(
        `${getModuleName(
          prefix,
        )} - Canceled (stale) proposal from action [${prefixedPath(
          actionName,
        )}] in step-ID [${sam.stepId}]. Props:`,
        props,
      );
    }

    function getControlState(state) {
      const states = computeStateRepresentation(state) || [];

      if (!Array.isArray(states) || states.length < 1) {
        throw new Error("Invalid control state.");
      }

      if (preventCompoundState && states.length > 1) {
        const names = states.map(([name]) => name).join(";");
        throw new Error(
          `${getModuleName(prefix)} - State is compound state: ${names}`,
        );
      }

      const [[name, allowedActions]] = mergeControlStates(states);

      return { name, allowedActions };
    }

    function getNextAction(sam, model) {
      const controlStateName = sam.controlState.name;
      // TODO: Remove redundant array (and use object if needed instead)
      const [nextActions] = computeNextAction(controlStateName, model) || [[]];

      return nextActions;
    }

    function runNextAction({ controller, nextActions }) {
      const napProp = { _isNap: true }; // TODO: Secure this

      let signalRun;

      if (nextActions.length === 1) {
        const [signalName, signalInput = {}] = nextActions[0];
        signalRun = controller.getSignal(prefixedPath(signalName))({
          ...signalInput,
          ...napProp,
        });
      } else {
        const [[compoundName, proposalPromises]] = mergeActions({
          controller,
          actions,
          nextActions,
        });
        const compoundAction = getCompoundSignal(
          compoundName,
          proposalPromises,
          napProp,
        );
        const signal = samStepFactory(compoundAction, GetId);
        signalRun = controller.run(compoundName, signal, napProp);
      }

      return signalRun;
    }
  }
};
