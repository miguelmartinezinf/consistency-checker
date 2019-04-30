// logging.service.js

const log = require('../helpers/log.helper');


function startLogger() {
  log.initLogger();
}

module.exports = {
  startLogger,
};
