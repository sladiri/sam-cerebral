import Router from "@cerebral/router";

export const routeMap = {
  "/": {
    page: "root",
    prefix: "",
  },
  "/napsack": {
    page: "napSack",
    prefix: "napSack",
  },
  "/atm": {
    page: "atm",
    prefix: "atm",
  },
  "/blog": {
    page: "blog",
    prefix: "blog",
  },
};

const routes = Object.entries(routeMap).map(([key, val]) => ({
  path: key,
  signal: `${val.page}Routed`,
}));

export default Router({ routes });
