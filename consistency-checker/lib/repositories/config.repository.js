// config.repository.js

// Config store
let storageConfig = {};

function getConfig() {
  return storageConfig;
}

function setConfig(config) {
  storageConfig = config;
}

module.exports = {
  getConfig,
  setConfig,
};
