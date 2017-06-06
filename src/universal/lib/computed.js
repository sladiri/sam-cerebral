import { compute } from "cerebral";
import { state } from "cerebral/tags";
import { getModulePath } from "./util";

export const appViewModel = compute(function appViewModel(get) {
  return {
    count: get(state`count`),
  };
});

export const napSackViewModel = compute(function appViewModel(get) {
  return {
    activities: get(state`napSack.activities`),
  };
});

export const actionsDisabled = prefix =>
  compute(function actionsDisabled(get) {
    return get(state`${getModulePath(prefix, "sam.proposeInProgress")}`);
  });

export const cancelDisabled = prefix =>
  compute(function cancelDisabled(get) {
    return (
      get(state`${getModulePath(prefix, "sam.acceptAndNapInProgress")}`) ||
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