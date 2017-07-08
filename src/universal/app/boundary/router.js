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

export const routes = Object.entries(routeMap).map(([key, val]) => ({
  path: key,
  signal: `${val.page}Routed`,
}));
