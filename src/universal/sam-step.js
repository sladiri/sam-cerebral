import { innerJoin } from "ramda";
import { getId, getModulePath, getSignal } from "./util";

export function samFactory({
  prefix = "",
  accept,
  computeControlState,
  computeNextAction,
  controlState,
  allowedActions,
  actions,
  preventCompoundState = true,
}) {
  const prefixedPath = getModulePath(prefix);
  const _GetId = getId(); // Reuse this for automatic next-actions.

  return function samStepFactory(action, GetId = _GetId) {
    if (Array.isArray(action)) {
      const [name, tree] = action;
      action = { name, tree };
    } else if (!action.name) {
      console.log("action", action);
      throw new Error(
        "Action must have a name. Provide a named function or an array ([name, [functionTree]])",
      );
    }

    const actionName = action.name;

    return samStep;

    async function samStep(input) {
      try {
        const { controller, state, props } = input;

        if (getState("sam.stepId") === undefined) {
          setState("sam", {
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

        if (!guardDisallowedAction(getState("sam"))) {
          logDisallowedAction(props, getState("sam"));
          return;
        }

        logPossibleInterrupt(props, getState("sam"));

        if (!guardSignalInterrupt(props._isNap, getState("sam"))) {
          logInterruptFailed(props, getState("sam"));
          return;
        }

        setState("sam.proposeInProgress", actionName);
        const stepId = getState("sam.stepId");
        const { _abortAction, ...proposal } = await getProposal(
          props,
          controller,
        );

        if (!guardEmptyProposal(_abortAction, getState("sam"))) {
          logEmptyProposal(getState("sam"));
          setState("sam.proposeInProgress", false);
          emitNapDone(prefix)({ controller });
          return;
        }

        if (!guardStaleProposal(stepId, getState("sam"))) {
          logStaleProposal(props, getState("sam"));
          return;
        }

        if (getState("sam.init")) {
          setState("sam.init", false);
        }

        setState("sam.proposeInProgress", false);
        setState("sam.acceptInProgress", actionName);
        setState("sam.stepId", GetId.next().value);
        await accept({ state, props: proposal });
        setState("sam.acceptInProgress", false);
        setState("sam.controlState", getControlState(getState("")));

        const { nextActions, _syncNap } = getNextAction(getState("sam"));

        if (nextActions.length < 1) {
          setState("sam.napInProgress", false);
          emitNapDone(prefix)({ controller });
          return;
        }

        setState(
          "sam.napInProgress",
          nextActions.map(([name]) => name).join(","),
        );
        setState("sam.syncNap", _syncNap);

        await runNextAction(controller, nextActions, samStep);

        function getState(path) {
          const fullPath = `${prefixedPath(path)}`;
          return state.get(fullPath === "" ? undefined : fullPath);
        }

        function setState(path, value) {
          state.set(`${prefixedPath(path)}`, value);
        }
      } catch (error) {
        console.error("SAM step catched an error", error);
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
        `Disallowed action [${prefixedPath(
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
          `Possible cancelation by action [${prefixedPath(
            actionName,
          )}] for pending action [${prefixedPath(
            proposeInProgress,
          )}] in step-ID [${stepId}]. Props:`,
          props,
        );
      }
    }

    function guardSignalInterrupt(isNap, sam) {
      const { acceptInProgress, napInProgress, syncNap } = sam;
      return isNap || !(acceptInProgress || (napInProgress && syncNap));
    }

    function logInterruptFailed(props, sam) {
      const { napInProgress, acceptInProgress, controlState, stepId } = sam;
      const progressMsg = napInProgress
        ? `synchronous automatic action [${prefixedPath(
            napInProgress,
          )}] (NAP) for control-state [${controlState.name}]`
        : `accept for action [${acceptInProgress}]`;
      console.info(
        `Blocked action [${prefixedPath(
          actionName,
        )}], ${progressMsg} in progress in step-ID [${stepId}]. Props:`,
        props,
      );
    }

    async function getProposal(props, controller) {
      const proposal = await (action.tree
        ? do {
            let args = [actionName, action.tree, props];
            // if (input.controller.constructor.name === "UniversalController") {
            //   args = drop(1, args);
            // }
            controller.run(...args); // This shows up as separate signal in the debugger.
          }
        : action({ props }));

      return proposal !== undefined && Object.keys(proposal).length > 0
        ? proposal
        : { _abortAction: true };
    }

    function guardEmptyProposal(abortAction, sam) {
      return !sam.isInit || abortAction;
    }

    function logEmptyProposal(sam) {
      console.info(
        `Aborted empty proposal from action [${prefixedPath(
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
        `Canceled (stale) proposal from action [${prefixedPath(
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
        throw new Error("State is compound state:", names);
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
        throw new Error(`Invalid NAP after action [${actionName}]`);
      }

      return { nextActions, _syncNap: !allowNapInterrupt };
    }

    function runNextAction(controller, nextActions) {
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
        const signal = samStepFactory(compoundAction, GetId);
        args = [compoundName, signal, napProp];
      }

      // if (controller.constructor.name === "UniversalController") {
      //   args = drop(1, args);
      // }

      return controller.run(...args);
    }
  };
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

function mergeActions(actions, nextActions) {
  return nextActions
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
}

export const emitNapDone = prefix => ({ controller }) => {
  controller.emit(`napDone${prefix ? `-${prefix}` : ""}`);
};
