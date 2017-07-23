import { samFactory } from "../../samStep/boundary";
import { accept, computeControlState, computeNextAction } from "../entity";
import * as actions from "./actions";

export default prefix =>
  samFactory({
    prefix,
    accept,
    computeControlState,
    computeNextAction,
    actions,
  });
