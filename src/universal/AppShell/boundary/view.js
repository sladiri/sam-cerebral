import React from "react";
import { connect } from "cerebral/react";
import { state } from "cerebral/tags";

import withStyle from "./styles";
import { view as Blog } from "../../blog/boundary";

export default connect(
  {
    currentPage: state`currentPage`,
  },
  withStyle(function AppShell({ styles, currentPage }) {
    let page;

    switch (currentPage) {
      case "blog": {
        page = <Blog styles={{}} />;
        break;
      }
      default: {
        page = <h1>Page Not Found</h1>;
        break;
      }
    }

    return (
      <section className={styles.appShell}>
        {page}

        {/* TODO: Use token value in hidden input field in forms. */}
        <meta name="csrf-param" content="request_forgery_protection_token" />
        <meta name="csrf-token" content="form_authenticity_token" />
      </section>
    );
  }),
);
