import { connect } from "cerebral/react";
import { signal } from "cerebral/tags";

import React from "react";
import classNames from "classnames";

import { markActionsDisabled } from "../../../samStep/boundary";
import { model } from "../computed";

import { actionFog } from ".";

export default connect(
  {
    model,
    login: signal`blog.login`,
    logout: signal`blog.logout`,
    cancel: signal`blog.cancel`,
    markActionsDisabled: markActionsDisabled("blog"),
  },
  (
    { model, login, logout, markActionsDisabled, ...connectedProps },
    parentProps,
  ) => ({
    model,
    ...parentProps,
    ...connectedProps,
    actions: { ...markActionsDisabled({ login, logout }) },
  }),
  function UserForm({ model, actions, className, css }) {
    const formClass = classNames(
      className,
      css.flex,
      css["items-center"],
      css["justify-center"],
    );
    return model.userName
      ? <form
          onSubmit={event => {
            event.preventDefault();
            actions.logout();
          }}
          className={formClass}
        >
          <button
            disabled={actions.logout.disabled()}
            className={classNames(actionFog(css, actions.logout), css["w-40"])}
          >
            Logout
          </button>
        </form>
      : <form
          onSubmit={event => {
            event.preventDefault();
            actions.login({
              userName: event.target.getElementsByTagName("input")[0].value,
            });
          }}
          className={formClass}
        >
          <input
            disabled={actions.login.disabled()}
            className={classNames(
              actionFog(css, actions.login),
              css["w-40"],
              css.tc,
              css.mh2,
            )}
            placeholder="Alfons"
          />
          <button
            disabled={actions.login.disabled()}
            className={classNames(
              actionFog(css, actions.login),
              css["w-20"],
              css.mh2,
            )}
          >
            Login
          </button>
        </form>;
  },
);
