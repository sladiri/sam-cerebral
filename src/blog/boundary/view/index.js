import { connect } from "cerebral/react";

import React from "react";
import classNames from "classnames";

import { model } from "../computed";

import ClearPostsForm from "./ClearPostsForm";
import UserForm from "./UserForm";
import PostForm from "./PostForm";
import PostsList from "./PostsList";

export const viewFactory = SamStatus => {
  const Blog = ({ model, className }) => {
    const formClass = "mv3";

    return (
      <section className={className}>
        <SamStatus className="mb2" />

        <ClearPostsForm className={formClass} />

        <p className="tc">
          User: {model.userName || "none (log in to post)"}
        </p>

        <UserForm className={formClass} />

        <PostForm className={formClass} />

        <PostsList />
      </section>
    );
  };

  return connect({ model }, Blog);
};

export const actionFog = (action, ...args) =>
  action.disabled(...args) && classNames("o-50", "strike");
