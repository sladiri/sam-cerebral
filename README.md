# SAM and Cerebral
- Example implementation of the **SAM pattern** ([home](http://sam.js.org/)).
- Uses the **Cerebral** framework ([home](http://cerebraljs.com/)).
- Project folder structure according to the **Control-Entity-Boundary** (ECB) pattern ([blog post](http://www.adam-bien.com/roller/abien/entry/bureaucratic_design_with_java_ee)).

## Quick Start
- `npm` installs all dependencies.
- `npm run build` formats the code with **Prettier**, lints it with **Eslint**, then writes transpiled `bundle.js` and server files.
- `npm start` starts a **Koa** webserver which serves bundle.js (server-side-rendering).
- `npm run start-dev` starts the webserver in babel-node (watch + rebuild).
- `npm run start-budo` starts the **Budo** development-webserver and serves the directory (watch + rebuild + autoreload).

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
