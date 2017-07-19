# SAM and Cerebral
- Example implementation of the **SAM pattern** ([home](http://sam.js.org/)).
- Uses the **Cerebral** framework ([home](http://cerebraljs.com/)).
- Cerebral modules folder structure according to the **Control-Entity-Boundary** (ECB) pattern ([blog post](http://www.adam-bien.com/roller/abien/entry/bureaucratic_design_with_java_ee)).

## Quick Start
- `npm` installs all dependencies.
- `npm run start-budo` starts the **Budo** development-webserver and serves the directory (watch + rebuild + autoreload).
- **Currently these requires a forked version of Cerebral** ([pull request](https://github.com/cerebral/cerebral/pull/981))
  - `npm run build` formats the code with **Prettier**, lints it with **Eslint**, then writes transpiled `bundle.js` and server files.
  - `npm start` starts a **Koa** webserver which serves bundle.js (server-side-rendering).
  - `npm run start-dev` starts the webserver in babel-node (watch + rebuild).

## SAM pattern and Cerebral
- A Cerebral module may be implemented as a SAM container.
Each Cerebral signal is a SAM-step action, and this ensures that the state is updated in a precisely defined step (as in TLA+).
- Only the `propose` function inside the model has write access to `state` and persists data.
- Inside Cerebral's `connect` function we compute the state-representation (view-model).

## SAM and the Entity Control Boundary pattern
The SAM pattern maps to the ECB pattern:
- `entity --> model, compute state, compute next action`
- `control --> actions + third party APIs`
- `boundary --> Cerebral module + storage`

## ToDo
- [ ] App features
  - [ ] Add blog post example (conflict-free example). No replies without parent should be shown because of eventual consistency.
    - [ ] post posts
    - [ ] reply to posts

  - [ ] Add Git-like example (with conflict management)? Track concurrent changes and show causal chain for conflict resolution by user.

  - [ ] Use control state for page change (routing) example?
  - [ ] Add session control state example (log in <-> log out on authenticated route)?

- [ ] Storage layer
  - [x] Add PouchDB provider to Cerebral context
  - [ ] Save model to DB
  - [ ] Specify _Bolt-on Shim Layer_ in TLA+
  - [ ] Implement _Bolt-on Shim Layer_

- [x] Allow for next action to not block step until complete (blockStep = true)?
  - [ ] Queue action when received signal while in (NAP?) progress?

- [ ] Add tests.
- [ ] Create Proxy to hide state API?
- [ ] Defer updating the view until end of SAM step? (State updates may trigger rerending immediately currently.)
- [x] Check allowed action in step.

## Wont Fix For Now
- Prevent or at least warn about concurrent mutations while a step is in progress?

## Notes
- Async Ticker is not a simple next action example. Ticker could be a singleton.
