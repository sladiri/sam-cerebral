import { connect } from "cerebral/react";
import { state } from "cerebral/tags";
import { wrap, ReactFreeStyleContext } from "react-free-style";

import { getModulePath, addDisplayName } from "../../util/control";
import SamStatusFactory from "./SamStatus";

export const viewFactory = (prefix, name = "SamStatus") => {
  const displayName = `${name}${prefix ? `[${prefix}]` : ""}`;
  const namedView = addDisplayName(SamStatusFactory(prefix), displayName);
  namedView.contextTypes = ReactFreeStyleContext;

  return connect(
    {
      proposeInProgress: state`${getModulePath(
        prefix,
        "_sam.proposeInProgress",
      )}`,
      acceptInProgress: state`${getModulePath(
        prefix,
        "_sam.acceptInProgress",
      )}`,
      napInProgress: state`${getModulePath(prefix, "_sam.napInProgress")}`,
      syncNap: state`${getModulePath(prefix, "_sam.syncNap")}`,
    },
    wrap(namedView),
  );
};
