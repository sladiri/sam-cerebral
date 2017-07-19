import React from "react";
import classNames from "classnames";

import { withStyle } from "../../styles";

import Blog from "../Blog";

export default withStyle(function AppShell({ currentPage, styles: css }) {
  let page;

  switch (currentPage) {
    case "blog": {
      page = <Blog />;
      break;
    }
    default: {
      page = <h1>Page Not Found</h1>;
      break;
    }
  }

  return (
    <div className={classNames(css.pv2, css.ph1, css.f5)}>
      {page}

      {/* TODO: Use token value in hidden input field in forms. */}
      <meta name="csrf-param" content="request_forgery_protection_token" />
      <meta name="csrf-token" content="form_authenticity_token" />
    </div>
  );
});
