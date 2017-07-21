import React from "react";
import classNames from "classnames";
import { wrap, ReactFreeStyleContext } from "react-free-style";

import { getCss } from "../../styles/boundary";

import { view as Blog } from "../../blog/boundary";

const AppShell = ({ currentPage }, context) => {
  const css = getCss(context);
  let page;

  switch (currentPage) {
    case "blog": {
      page = <Blog />;
      break;
    }
    default: {
      page = <h1 className={css.tc}>Page Not Found</h1>;
      break;
    }
  }

  return (
    <div className={classNames(css.pa4, css.f5)}>
      {page}

      {/* TODO: Use token value in hidden input field in forms. */}
      <meta name="csrf-param" content="request_forgery_protection_token" />
      <meta name="csrf-token" content="form_authenticity_token" />
    </div>
  );
};
AppShell.contextTypes = ReactFreeStyleContext;

export default wrap(AppShell);
