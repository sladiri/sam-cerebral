# SAM and Cerebral
Example implementation of the **SAM pattern** (http://sam.js.org/) inside the **Cerebral** framework (http://cerebraljs.com/).

## Quick Start
- The development-webserver wants to serve Babel polyfills from dist/node_modules, so you need to create a symbolic link to node_modules.
- `npm start` starts a development-webserver and serves the directory.
- `npm run build` creates a transpiled `dist.js`.
- `npm run format` runs **Prettier** (https://github.com/prettier/prettier) which formats the all Javascipt files in `/src`.

## TODO
- [ ] Prevent or at least warn about concurrent mutations while a step is in progress.
- [ ] Allow for next action to not block step until complete?
- [ ] Add Routing control state example (log in <-> log out).
- [ ] Add tests.
