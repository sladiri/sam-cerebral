import React from "react";
import { connect } from "cerebral/react";
import { state } from "cerebral/tags";
import classNames from "classnames";

import { view as Blog } from "../../Blog/boundary";

export default connect(
  {
    currentPage: state`currentPage`,
  },
  function AppShell({ currentPage }) {
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
      <div className={classNames("pv2", "ph1", "f5")}>
        {page}

        {/* TODO: Use token value in hidden input field in forms. */}
        <meta name="csrf-param" content="request_forgery_protection_token" />
        <meta name="csrf-token" content="form_authenticity_token" />
      </div>
    );
  },
);
