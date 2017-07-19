import { samFactory } from "../../samStep";
import { accept, computeControlState, computeNextAction } from "./entity";
import * as actions from "./control";

export default prefix =>
  samFactory({
    prefix,
    accept,
    computeControlState,
    computeNextAction,
    actions,
  });
