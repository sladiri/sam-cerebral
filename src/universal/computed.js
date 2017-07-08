import { compute } from "cerebral";

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
