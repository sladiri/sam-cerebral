import { compute } from "cerebral";
import { state } from "cerebral/tags";

export const appModel = compute(function appModel(get) {
  return {
    count: get(state`count`),
  };
});

export const actionsDisabled = proposeInProgress =>
  compute(proposeInProgress, function actionsDisabled(proposeInProgress) {
    return proposeInProgress;
  });

export const cancelDisabled = (acceptAndNapInProgress, napInProgress) =>
  compute(acceptAndNapInProgress, napInProgress, function cancelDisabled(
    acceptAndNapInProgress,
    napInProgress,
  ) {
    return acceptAndNapInProgress || napInProgress;
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
