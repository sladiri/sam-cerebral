import { connect } from "cerebral/react";

import React from "react";
import classNames from "classnames";

import { model } from "../computed";

import ClearPostsForm from "./ClearPostsForm";
import UserForm from "./UserForm";
import PostForm from "./PostForm";
import PostsList from "./PostsList";

export const viewFactory = SamStatus => {
  const Blog = ({ css, model, className }) => {
    const formClass = css.mv3;

    return (
      <section className={className}>
        <SamStatus className={classNames(css.mb2)} />

        <ClearPostsForm className={formClass} css={css} />

        <p className={css.tc}>
          User: {model.userName || "none (log in to post)"}
        </p>

        <UserForm className={formClass} css={css} />

        <PostForm className={formClass} css={css} />

        <PostsList css={css} />
      </section>
    );
  };

  return connect({ model }, Blog);
};

export const actionFog = (css, action, ...args) =>
  action.disabled(...args) && classNames(css["o-50"], css.strike);
