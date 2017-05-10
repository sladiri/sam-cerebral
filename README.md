# SAM and Cerebral
- Example implementation of the **SAM pattern** ([home](http://sam.js.org/)).
- Uses the **Cerebral** framework ([home](http://cerebraljs.com/)).
- Folder structure according to **Boundary-Control-Entity** ([blog post](http://www.adam-bien.com/roller/abien/entry/bureaucratic_design_with_java_ee)).

## Quick Start
- `yarn` installs all dependencies.
- `npm start` starts the **Budo** development-webserver and serves the directory.
- `npm run format` runs **Prettier** which formats the code.
- `npm run lint` runs **ES-lint** checks a small number of rules to prevent common runtime errors.
- `npm run build` formats the code, lints it, then creates a transpiled `dist.js`.

## SAM pattern
Each signal is wrapped in a SAM-step. Only its `propose` function has write access to `state`.

## TODO
- [x] Prevent or at least warn about concurrent mutations while a step is in progress?
- [ ] Check allowed action in step.
- [ ] Use control state for page change (routing)?
- [ ] Add session control state example (log in <-> log out on authenticated route).
- [ ] Allow for next action to not block step until complete?
- [ ] Queue action when received signal while in progress?
- [ ] Add tests.
