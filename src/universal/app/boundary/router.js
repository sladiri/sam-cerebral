import Router from "@cerebral/router";

export default Router({
  routes: [
    {
      path: "/",
      signal: "rootRouted",
    },
    {
      path: "/napsack",
      signal: "napSackRouted",
    },
    {
      path: "/atm",
      signal: "atmRouted",
    },
  ],
  // query: false, // Query support
  // onlyHash: false, // Use hash urls
  // baseUrl: "/", // Only handle url changes on nested path
});
