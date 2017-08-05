import { connect } from "cerebral/react";
import { state } from "cerebral/tags";

import React from "react";
import classNames from "classnames";
import { wrap, ReactFreeStyleContext } from "react-free-style";

import { getCss } from "../../styles/boundary";

import { view as Blog } from "../../blog/boundary";

const getPageMap = css => ({
  blog: <Blog css={css} />,
  undefined: <h1 className={css.tc}>Page Not Found</h1>,
});

const AppShell = ({ currentPage }, context) => {
  const css = getCss(context);
  const pageMap = getPageMap(css);

  return (
    <div className={classNames(css.pa4, css.f5)}>
      {pageMap[currentPage]}
    </div>
  );
};
AppShell.contextTypes = ReactFreeStyleContext;

export default connect({ currentPage: state`currentPage` }, wrap(AppShell));

/*
  TODO: Use token value in hidden input field in forms.
  <meta name="csrf-param" content="request_forgery_protection_token" /> 
  <meta name="csrf-token" content="form_authenticity_token" /> 
*/
