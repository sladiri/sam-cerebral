x# SAM and Cerebral
Example implementation of the **SAM pattern** (http://sam.js.org/) inside the **Cerebral** framework (http://cerebraljs.com/).

## Quick Start
- The development-webserver wants to serve Babel polyfills from dist/node_modules, so you need to create a symbolic link to node_modules.
- `npm start` starts a development-webserver and serves the directory.
- `npm run format` runs **Prettier** which formats the code.
- `npm run lint` runs **ES-lint** checks a small number of rules to prevent common runtime errors.
- `npm run build` formats the code, lints it, then creates a transpiled `dist.js`.

## SAM pattern
Each signal is wrapped in a SAM-step. Only its `propose` function has write access to `state`.

## TODO
- [x] Prevent or at least warn about concurrent mutations while a step is in progress?
- [ ] Use control state for page change (routing).
- [ ] Add session control state example (log in <-> log out on authenticated route).
- [ ] Allow for next action to not block step until complete?
- [ ] Add tests.
