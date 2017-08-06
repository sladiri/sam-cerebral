import { connect } from "cerebral/react";
import { state } from "cerebral/tags";

import React from "react";

import { view as Blog } from "../../blog/boundary";

const pageMap = {
  blog: <Blog />,
  undefined: <h1 className="tc">Page Not Found</h1>,
};

const AppShell = ({ currentPage }) => {
  return (
    <div className="pa4">
      {pageMap[currentPage]}
    </div>
  );
};

export default connect({ currentPage: state`currentPage` }, AppShell);

/*
  TODO: Use token value in hidden input field in forms.
  <meta name="csrf-param" content="request_forgery_protection_token" /> 
  <meta name="csrf-token" content="form_authenticity_token" /> 
*/
