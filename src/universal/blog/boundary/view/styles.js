import { styled } from "react-free-style";

import defaults from "../../../styles";

export default styled({
  ...defaults,
  blogMetaInfo: {
    fontSize: "70%",
  },
  blogDeleted: {
    textDecoration: "line-through",
  },
});
