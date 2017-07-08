import Router from "@cerebral/router";

export const routeMap = {
  "/": {
    page: "root",
    module: "",
  },
  "/napsack": {
    page: "napSack",
    module: "napSack",
  },
  "/atm": {
    page: "atm",
    module: "atm",
  },
};

const routes = Object.entries(routeMap).map(([key, val]) => ({
  path: key,
  signal: `${val.page}Routed`,
}));

export default Router({ routes });
