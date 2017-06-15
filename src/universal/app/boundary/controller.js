import { Controller } from "cerebral";
import module from "./module";

export default do {
  const result = Controller(module);

  // result.on("start", (execution, payload) => {
  //   console.log("function tree start", { execution, payload });
  // });

  // result.on("end", (execution, payload) => {
  //   console.log("function tree end", { execution, payload });
  // });

  // result.on("functionStart", (execution, functionDetails, payload) => {
  //   if (functionDetails.name === "proposeProposal")
  //     console.log("function tree functionStart", functionDetails.name, payload);
  // });

  result.getSignal("init")({});
  result.getSignal("napSack.init")({});

  result;
};
