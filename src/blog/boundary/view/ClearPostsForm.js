import { connect } from "cerebral/react";
import { signal } from "cerebral/tags";

import React from "react";
import classNames from "classnames";

import { markActionsDisabled } from "../../../samStep/boundary";

import { actionFog } from ".";

export default connect(
  {
    refresh: signal`blog.refresh`,
    sync: signal`blog.sync`,
    removeAll: signal`blog.removeAll`,
    markActionsDisabled: markActionsDisabled("blog"),
  },
  (
    { refresh, sync, removeAll, markActionsDisabled, ...connectedProps },
    parentProps,
  ) => ({
    ...parentProps,
    ...connectedProps,
    actions: {
      ...markActionsDisabled({ refresh, sync, removeAll }),
    },
  }),
  function ClearPostsForm({ actions, className }) {
    const formClass = classNames("flex", "justify-center", className);
    return (
      <div className={formClass}>
        <button
          disabled={actions.refresh.disabled()}
          className={classNames(actionFog(actions.refresh), "w-25 f7")}
          onClick={() => {
            actions.refresh({});
          }}
        >
          refresh
        </button>
        <button
          disabled={actions.removeAll.disabled()}
          className={classNames(actionFog(actions.removeAll), "w-25 f7")}
          onClick={() => {
            actions.removeAll({});
          }}
        >
          clear DB
        </button>
        <button
          disabled={actions.sync.disabled()}
          className={classNames(actionFog(actions.sync), "w-25 f7")}
          onClick={() => {
            actions.sync({});
          }}
        >
          sync DB
        </button>
        <button
          disabled={actions.sync.disabled()}
          className={classNames(actionFog(actions.sync), "w-25 f7")}
          onClick={() => {
            actions.sync({ live: true });
          }}
        >
          sync live
        </button>
        <button
          disabled={actions.sync.disabled()}
          className={classNames(actionFog(actions.sync), "w-25 f7")}
          onClick={() => {
            actions.sync({ stop: true });
          }}
        >
          stop sync
        </button>
      </div>
    );
  },
);
