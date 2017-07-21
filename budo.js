const compression = require("compression");

require("budo").cli(process.argv.slice(2), {
  middleware: compression(),
});
