import { samFactory } from "../../sam-step";
import { accept, computeControlState, computeNextAction } from "../entity";
import * as actions from "../control";

export default prefix =>
  samFactory({
    prefix,
    accept,
    computeControlState,
    computeNextAction,
    controlState: "normal",
    allowedActions: ["init"],
    actions,
  });
