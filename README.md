# browser-boiler
A minimal project with the **Budo** development server, **Prettier** formatting, **Browserify** and **Babel** for some new syntax.

## Quick Start
- The development-webserver wants to serve Babel polyfills from dist/node_modules, so you need to create a symbolic link to node_modules.
- `yarn` installs all dependencies.
- `npm start` starts the **Budo** development-webserver and serves the directory (https://github.com/mattdesl/budo).
- `npm run format` runs **Prettier** which formats the code (https://github.com/prettier/prettier).
- `npm run lint` runs **ES-lint** checks a small number of rules to prevent common runtime errors.
- `npm run build` formats the code, lints it, then creates a transpiled `dist.js`.

## TODO
- [ ] Add PostCSS?
- [ ] Add tests
- [ ] Fix Budo path to node_modules?
