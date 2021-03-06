# SAM and Cerebral

- Example implementation of the **SAM pattern** ([home](http://sam.js.org/)).
- Uses the **Cerebral** framework ([home](http://cerebraljs.com/)).
- Project folder structure follows the **Control-Entity-Boundary** (ECB) pattern ([blog post](http://www.adam-bien.com/roller/abien/entry/bureaucratic_design_with_java_ee)).

## Quick Start

- `npm` installs all dependencies.
- `npm run build` sets up static dependencies for the website.
- `npm start` starts the __Budo__ development-webserver and serves the directory (watch + rebuild + autoreload).
- `npm run lint` formats the code with __Prettier__ and checks few __Eslint__ rules.

## SAM pattern and Cerebral

- A Cerebral module may be implemented as a SAM container. Each Cerebral signal is a SAM-step action, and this ensures that the model is updated in a precisely defined step (as in TLA+).
- Triggering an action may execute a step, if there is a proposal.
- A proposal in turn may trigger an indeterminate (see _Actor Model_) amount of automatic next-actions via the _next-action-predicate_ function.
- Only the _accept_ function has write access to the model.
- The _computeStateRepresentation_ function derives the _state-representation_ (view-model). It also gives a hint in form of a list of allowed actions, so that buttons, etc. can be disabled in the UI.
- **Although technically wrong, in this implementation, the model is saved in the Cerebral state-tree as well, just to be visible in Cerebral's debugger. This also allows the model or parts of it to be used as view-model, which requires less code for this exercise.**
- Helper functions allow communication between SAM-step-containers. If one container calls an action of another, it should wait for the other to compute its _state-representation_, which is the (asynchronous) return value of the action-call.

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
    - [ ] like posts and show counter per user (publicly visible)

  - [ ] Add Git-like example (with conflict management)? Track concurrent changes and show causal chain for conflict resolution by user.

  - [ ] Use control state for page change (routing) example?
  - [ ] Add session control state example (log in <-> log out on authenticated route)?
  - [ ] Use security token.
  - [ ] Add notification service when remote changes arrive.
  - [ ] Prevent automatic example post by more than one user?

- [ ] Storage layer
  - [x] Add PouchDB provider to Cerebral context
  - [x] Save model to DB
  - [ ] Specify _Bolt-on Shim Layer_ in TLA+
  - [ ] Implement _Bolt-on Shim Layer_
    - [ ] Globally unique identifier for local store
    - [ ] Local Lamport time-stamp sequence number for writes
    - [ ] As external service?
    - [ ] Remove SAM container semantics?
    - [x] Refactor shim module to be sub-module?

- [ ] SAM container
  - [x] Allow for next action to not block step until complete (blockStep = true)? -> No
  - [x] Queue action to NAP when in progress (optionally)
  - [ ] Compute: Mark action specific cancel buttons as disabled.

- [x] Check allowed action in step.
- [ ] Add tests.
- [ ] Create Proxy to hide state API?
- [ ] Defer updating the view until end of SAM step? (State updates may trigger rerending immediately currently.)

## Consider
- Prevent or at least warn about concurrent mutations while a step is in progress?

## Notes
- Async Ticker is not a simple next action example. Ticker could be a singleton.
