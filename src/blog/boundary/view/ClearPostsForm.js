import { connect } from "cerebral/react";
import { signal } from "cerebral/tags";

import React from "react";
import classNames from "classnames";

import { markActionsDisabled } from "../../../samStep/boundary";

import { actionFog } from ".";

export default connect(
  {
    clearDb: signal`blog.clearDb`,
    refresh: signal`blog.refresh`,
    markActionsDisabled: markActionsDisabled("blog"),
  },
  (
    { clearDb, refresh, markActionsDisabled, ...connectedProps },
    parentProps,
  ) => ({
    ...parentProps,
    ...connectedProps,
    actions: { ...markActionsDisabled({ clearDb, refresh }) },
  }),
  function ClearPostsForm({ actions, className }) {
    const formClass = classNames("flex", "justify-center", className);
    return (
      <div className={formClass}>
        <button
          disabled={actions.clearDb.disabled()}
          className={classNames(actionFog(actions.clearDb), "w-50")}
          onClick={() => {
            actions.clearDb({});
          }}
        >
          clear posts DB
        </button>
        <button
          disabled={actions.refresh.disabled()}
          className={classNames(actionFog(actions.refresh), "w-30")}
          onClick={() => {
            actions.refresh({});
          }}
        >
          refresh
        </button>
      </div>
    );
  },
);
