# SAM and Cerebral
- Example implementation of the **SAM pattern** ([home](http://sam.js.org/)).
- Uses the **Cerebral** framework ([home](http://cerebraljs.com/)).
- Project folder structure follows the **Control-Entity-Boundary** (ECB) pattern ([blog post](http://www.adam-bien.com/roller/abien/entry/bureaucratic_design_with_java_ee)).

## Quick Start
- `npm` installs all dependencies.
- `npm run build` sets up static dependencies for the website.
- `npm run lint` formats the code with __Prettier__ and checks few __Eslint__ rules.
- `npm start` starts the __Budo__ development-webserver and serves the directory (watch + rebuild + autoreload).

## SAM pattern and Cerebral
- A Cerebral module may be implemented as a SAM container.
Each Cerebral signal is a SAM-step action, and this ensures that the state is updated in a precisely defined step (as in TLA+).
- Only the _accept_ function inside the model has write access to the model.
- The _state-representation_ (view-model) is the Cerebral state tree, and _accept_ may hide internal state (the "real model"). **The _state-representation_ should technically be the place to create the view-model, but this requires more code and this example shows a "simpler" implementation.**
- Helper functions allow communication between SAM-step-containers.

## SAM and the Entity Control Boundary pattern
The SAM pattern maps to the ECB pattern too:
- `boundary --> View component`
- `control --> Cerebral module, actions, third party APIs`
- `entity --> model (accept), compute state, compute next action`

## ToDo
- [ ] App features
  - [ ] Add blog post example (conflict-free example). No replies without parent should be shown because of eventual consistency.
    - [x] post posts
    - [x] reply to posts

  - [ ] Add Git-like example (with conflict management)? Track concurrent changes and show causal chain for conflict resolution by user.

  - [ ] Use control state for page change (routing) example?
  - [ ] Add session control state example (log in <-> log out on authenticated route)?
  - [ ] Use security token.
  - [ ] Add notification service when remote changes arrive.

- [ ] Storage layer
  - [x] Add PouchDB provider to Cerebral context
  - [x] Save model to DB
  - [ ] Specify _Bolt-on Shim Layer_ in TLA+
  - [ ] Implement _Bolt-on Shim Layer_
  - [x] Refactor shim module to be sub-module?

- [ ] SAM container
  - [ ] Compute: Mark action specific cancel buttons as disabled.
  - [x] Allow for next action to not block step until complete (blockStep = true)?
    - [ ] Queue action when received signal while in (NAP?) progress?

- [x] Check allowed action in step.
- [ ] Add tests.
- [ ] Create Proxy to hide state API?
- [ ] Defer updating the view until end of SAM step? (State updates may trigger rerending immediately currently.)

## Consider
- Prevent or at least warn about concurrent mutations while a step is in progress?

## Notes
- Async Ticker is not a simple next action example. Ticker could be a singleton.
