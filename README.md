# SAM and Cerebral
- Example implementation of the **SAM pattern** ([home](http://sam.js.org/)).
- Uses the **Cerebral** framework ([home](http://cerebraljs.com/)).
- Folder structure according to the **Control-Entity-Boundary** (ECB) pattern ([blog post](http://www.adam-bien.com/roller/abien/entry/bureaucratic_design_with_java_ee)).

## Quick Start
- `yarn` installs all dependencies (`[prettier eslint babel-eslint eslint-plugin-react]` assumed globally).
- `npm start` starts the **Budo** development-webserver and serves the directory.
- `npm run format` runs **Prettier** which formats the code.
- `npm run lint` runs **ES-lint** checks a small number of rules to prevent common runtime errors.
- `npm run build` formats the code, lints it, then creates a transpiled `dist.js`.

## SAM pattern
Each Cerebral signal is wrapped in a SAM-step signal:
- This SAM-step signal calls the action, propose, and the listener functions: `compute control state`, `next action predicate`. The view update is triggered immediately by Cerebral, when the state is updated.
- Only the `propose` function has write access to `state`.
- Cerebral's connect plays the role of decoupling the model from the view and computing a view-model. (Simple mappings do not require a function.)

## Entity Control Boundary pattern
The SAM pattern maps to the ECB pattern:
- model: entity
- actions, compute state, compute next action: control
- Cerebral module: boundary

## TODO
- [ ] Async Ticker is not a good next action example. Ticker should be a singleton.
- [ ] Defer updating the view until end of SAM step? (State updates may trigger rerending immediately currently.)
- [ ] Create Proxy to hide state API?
- [ ] Use control state for page change (routing) example?
- [ ] Add session control state example (log in <-> log out on authenticated route).
- [ ] Allow for next action to not block step until complete (blockStep = true)?
- [ ] Queue action when received signal while in (NAP?) progress? (see previous)
- [ ] Add tests.
- [x] Prevent or at least warn about concurrent mutations while a step is in progress?
- [x] Check allowed action in step.
