# browser-boiler
A minimal project with **Prettier formatting** (https://github.com/prettier/prettier), **Browserify** and **Babel** for some new syntax.

## Quick Start
- The development-webserver wants to serve Babel polyfills from dist/node_modules, so you need to create a symbolic link to node_modules.
- `npm start` starts a development-webserver and serves the directory.
- `npm run build` creates a transpiled `dist.js`.
- `npm run format` runs **Prettier** which formats the all Javascipt files in `/src`.

## TODO
- [ ] Add PostCSS?
- [ ] Add tests
- [ ] Fix Budo path to node_modules?
