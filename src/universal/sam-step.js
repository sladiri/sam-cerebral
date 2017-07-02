import { innerJoin, memoize, omit, pickBy, type } from "ramda";
import { getId, getModulePath } from "./util";

export function samFactory({
  prefix = "", // Cannot save undefined to state
  accept,
  computeControlState,
  computeNextAction,
  controlState,
  allowedActions,
  actions,
  preventCompoundState = true,
}) {
  const prefixedPath = getModulePath(prefix);
  const prefixedStateProxy = getPrefixedStateProxy(prefixedPath);

  const _GetId = getId(); // Reuse this for automatic next-actions.

  return Object.keys(actions).reduce((acc, key) => {
    acc[key] = [samStepFactory(actions[key])];
    return acc;
  }, {});

  function samStepFactory(_action, GetId = _GetId) {
    const [action, actionName] = parseAction(_action);

    return samStep;

    async function samStep(input) {
      try {
        const { controller, props, db } = input;
        await db.init;

        const state = prefixedStateProxy(input.state);

        if (state.get("_sam.stepId") === undefined) {
          state.set("_sam", {
            stepId: GetId.next().value,
            init: true,
            controlState: { name: controlState, allowedActions },
            proposeInProgress: false,
            acceptInProgress: false,
            napInProgress: false,
            syncNap: true,
            prefix,
          });
        }

        if (!guardDisallowedAction(state.get("_sam"))) {
          logDisallowedAction(props, state.get("_sam"));
          return;
        }

        logPossibleInterrupt(props, state.get("_sam"));

        if (!guardSignalInterrupt(props, state.get("_sam"))) {
          logInterruptFailed(props, state.get("_sam"));
          return;
        }

        state.set("_sam.proposeInProgress", actionName);
        const stepId = state.get("_sam.stepId");
        const { _abortAction, ...proposal } = await getProposal({
          action,
          actionName,
          props,
          controller,
          db,
        });

        if (!guardEmptyProposal(_abortAction, state.get("_sam"))) {
          logEmptyProposal(state.get("_sam"));
          state.set("_sam.proposeInProgress", false);
          emitNapDone(prefix)({ controller });
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
          state: prefixedStateProxy(input.state, true),
          props: proposal,
          db,
        });
        state.set("_sam.acceptInProgress", false);
        state.set("_sam.controlState", getControlState(state.get()));

        const { nextActions, _syncNap } = getNextAction(state.get("_sam"));

        if (nextActions.length < 1) {
          state.set("_sam.napInProgress", false);
          emitNapDone(prefix)({ controller });
          return;
        }

        state.set(
          "_sam.napInProgress",
          nextActions.map(([name]) => name).join(","),
        );
        state.set("_sam.syncNap", _syncNap);

        await runNextAction({ controller, nextActions, db });
      } catch (error) {
        console.error(
          `${getModuleName(prefix)} - SAM step catched an error`,
          error,
        );
      }
    }

    function guardDisallowedAction(sam) {
      const { controlState } = sam;
      const actions = actionName.split(",");
      const commonActionsSet = innerJoin(
        (allowed, actionName) => allowed === actionName,
        controlState.allowedActions,
        actions,
      );
      return !controlState.name || commonActionsSet.length === actions.length;
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
      const { proposeInProgress, napInProgress, syncNap, stepId } = sam;
      if (
        proposeInProgress ||
        (proposeInProgress && napInProgress && !syncNap)
      ) {
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
      const { acceptInProgress, napInProgress, syncNap } = sam;
      return props._isNap || !(acceptInProgress || (napInProgress && syncNap));
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
      const states = computeControlState(state) || [];

      if (states.length < 1) {
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

    function getNextAction(sam) {
      const controlStateName = sam.controlState.name;
      const [nextActions, allowNapInterrupt = false] = computeNextAction(
        controlStateName,
      ) || [[]];

      if (!Array.isArray(nextActions)) {
        throw new Error(
          `${getModuleName(prefix)} - Invalid NAP after action [${actionName}]`,
        );
      }

      return { nextActions, _syncNap: !allowNapInterrupt };
    }

    function runNextAction({ controller, nextActions, db }) {
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
          db,
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
}

function parseAction(action) {
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
}

async function getProposal({ action, actionName, props, controller, db }) {
  const proposal = await (action.tree
    ? controller.run(actionName, action.tree, props)
    : action({ props, db }));

  return proposal !== undefined && Object.keys(proposal).length > 0
    ? proposal
    : { _abortAction: true };
}

function mergeControlStates(states) {
  return states
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
}

function mergeActions({ controller, actions, nextActions, db }) {
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
          db,
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
}

function getCompoundSignal(compoundName, proposalPromises, props) {
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
}

export const emitNapDone = prefix => ({ controller }) => {
  controller.emit(`napDone${prefix ? `-${prefix}` : ""}`);
};

const getPrefixedStateProxy = prefixedPath =>
  memoize((state, scoped) =>
    Object.keys(state).reduce((acc, key) => {
      acc[key] = (statePath, ...args) => {
        statePath = prefixedPath(statePath);
        if (statePath === "") statePath = undefined;
        let result = state[key](statePath, ...args);
        if (scoped && result) {
          result = pickBy((val, key) => {
            const field = result[key];
            return !type(field) !== "Object" || field._prefix === undefined;
          }, result);
          result = omit(["_sam", "_prefix"], result);
        }
        return result;
      };
      return acc;
    }, {}),
  );

const getModuleName = name => (name === "" ? "root" : name);

export const addSamState = (_prefix, object) =>
  object.signals
    ? { ...object, state: { ...object.state, _prefix, _sam: {} } }
    : { ...object, _prefix, _sam: {} };
