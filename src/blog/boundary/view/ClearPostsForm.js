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
  function ClearPostsForm({ actions, className, css }) {
    const formWidthClass = css["w-50"];
    const formClass = classNames(
      className,
      css.flex,
      css["flex-column"],
      css["items-center"],
    );
    return (
      <div className={formClass}>
        <button
          disabled={actions.clearDb.disabled()}
          className={classNames(
            actionFog(css, actions.clearDb),
            formWidthClass,
          )}
          onClick={() => {
            actions.clearDb({});
          }}
        >
          clear posts DB
        </button>
        <br />
        <button
          disabled={actions.refresh.disabled()}
          className={classNames(
            actionFog(css, actions.refresh),
            formWidthClass,
          )}
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
