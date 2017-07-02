import { compute } from "cerebral";
import { state } from "cerebral/tags";
import { getModulePath } from "./util";

export const actionsDisabled = prefix =>
  compute(function actionsDisabled(get) {
    return (
      get(state`${getModulePath(prefix, "_sam.init")}`) ||
      get(state`${getModulePath(prefix, "_sam.proposeInProgress")}`) ||
      get(state`${getModulePath(prefix, "_sam.acceptInProgress")}`)
    );
  });

export const cancelDisabled = prefix =>
  compute(function cancelDisabled(get) {
    return (
      get(state`${getModulePath(prefix, "_sam.init")}`) ||
      get(state`${getModulePath(prefix, "_sam.acceptInProgress")}`) ||
      (get(state`${getModulePath(prefix, "_sam.napInProgress")}`) &&
        get(state`${getModulePath(prefix, "_sam.syncNap")}`))
    );
  });

export const addButtonStyles = (styles, actionsDisabled, cancelDisabled) =>
  compute(styles, actionsDisabled, cancelDisabled, function addButtonStyles(
    styles,
    actionsDisabled,
    cancelDisabled,
  ) {
    return {
      ...styles,
      buttonFog: `${actionsDisabled ? ` ${styles.fog}` : ""}`,
      cancelButtonFog: `${cancelDisabled ? ` ${styles.fog}` : ""}`,
    };
  });
