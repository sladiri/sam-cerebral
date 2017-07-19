import React from "react";
import { connect } from "cerebral/react";
import { state } from "cerebral/tags";
import classNames from "classnames";

import withStyle, { getStyles } from "../../styles/boundary";

import { view as Blog } from "../../Blog/boundary";

export default connect(
  {
    currentPage: state`currentPage`,
  },
  withStyle(function AppShell({ currentPage, styles }) {
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

    console.log(
      "sadsdf",
      styles["@media screen and (min-width: 30em) and (max-width: 60em)"],
    );
    return (
      <div className={classNames(getStyles(styles, [".pv2", ".ph1", ".f5"]))}>
        <p
          className={classNames(
            styles[".f3"],
            styles["@media screen and (min-width: 30em) and (max-width: 60em)"][
              ".f1-m"
            ],
          )}
        >
          Test
        </p>
        {page}

        {/* TODO: Use token value in hidden input field in forms. */}
        <meta name="csrf-param" content="request_forgery_protection_token" />
        <meta name="csrf-token" content="form_authenticity_token" />
      </div>
    );
  }),
);
