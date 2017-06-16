import { compute } from "cerebral";
import { state } from "cerebral/tags";
import { getModulePath } from "./util";

export const actionsDisabled = prefix =>
  compute(function actionsDisabled(get) {
    return (
      !get(state`${getModulePath(prefix, "sam")}`) ||
      get(state`${getModulePath(prefix, "sam.proposeInProgress")}`) ||
      get(state`${getModulePath(prefix, "sam.acceptInProgress")}`)
    );
  });

export const cancelDisabled = prefix =>
  compute(function cancelDisabled(get) {
    return (
      !get(state`${getModulePath(prefix, "sam")}`) ||
      get(state`${getModulePath(prefix, "sam.acceptInProgress")}`) ||
      get(state`${getModulePath(prefix, "sam.napInProgress")}`)
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
