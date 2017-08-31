import { compute } from "cerebral";
import { state } from "cerebral/tags";

import { getModulePath } from "../../util/control";

const _actionsDisabled = prefix =>
  compute(
    get =>
      get(state`${getModulePath(prefix, "_sam.init")}`) ||
      get(state`${getModulePath(prefix, "_sam.proposeInProgress")}`) ||
      get(state`${getModulePath(prefix, "_sam.acceptInProgress")}`) ||
      get(state`${getModulePath(prefix, "_sam.napInProgress")}`),
  );

const addDisabledMethod = actionDisabled => (acc, [key, val]) => {
  if (acc.enabled) throw new Error("Action already has enabled property.");
  val.disabled = (...args) =>
    val.isDisabled
      ? actionDisabled(key) || val.isDisabled(...args)
      : actionDisabled(key);
  acc[key] = val;
  return acc;
};

export const markActionsDisabled = prefix =>
  compute(
    _actionsDisabled(prefix),
    state`${getModulePath(prefix, "_sam.controlState.allowedActions")}`,
    (actionsDisabled, allowedActions = []) => {
      const actionDisabled = actionName =>
        actionsDisabled || !allowedActions.includes(actionName);
      return actions =>
        Object.entries(actions).reduce(addDisabledMethod(actionDisabled), {});
    },
  );

export const cancelDisabled = prefix =>
  compute(
    get =>
      get(state`${getModulePath(prefix, "_sam.init")}`) ||
      !get(state`${getModulePath(prefix, "_sam.proposeInProgress")}`) ||
      get(state`${getModulePath(prefix, "_sam.acceptInProgress")}`) ||
      (get(state`${getModulePath(prefix, "_sam.napInProgress")}`) &&
        get(state`${getModulePath(prefix, "_sam.syncNap")}`)),
  );
