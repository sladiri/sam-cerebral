import { connect } from "cerebral/react";
import { state } from "cerebral/tags";

import view from "./view";

export default connect(
  {
    currentPage: state`currentPage`,
  },
  view,
);
