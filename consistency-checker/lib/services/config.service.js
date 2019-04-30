// config.service.js

const configRepository = require('../repositories/config.repository');
const fileHelper = require('../helpers/file.helper');


// Get config from config storage
function getConfig() {
  const result = configRepository.getConfig();
  return result;
}

// Set the config in storage
function setConfig(config) {
  configRepository.setConfig(config);
}

async function loadContractAddress(contractAddress) {
  getConfig().contractAddress = contractAddress;
}

// Load config from file (json)
async function loadNodesConfig(filepath) {
  const config = await fileHelper.readFile(filepath);
  setConfig(config);
}

async function loadABI(filepath) {
  const abi = await fileHelper.readFile(filepath);
  getConfig().abi = abi;
}

async function loadOracleKeyfile(filepath) {
  const oracleKeyfile = await fileHelper.readFile(filepath);
  getConfig().oracleKeyfile = oracleKeyfile;
}

async function loadOraclePwd(pwd) {
  getConfig().oraclePwd = pwd;
}

async function loadOracleNode() {
  const nodes = getConfig().permissionedNodes;
  const oracleNode = nodes.filter(node => node.oracleNode === 'true')[0];
  getConfig().oracleNode = oracleNode;
}

async function loadStateRegistryMetadata() {
  // Bytecode
  const bytecode = await fileHelper.readPlainFile('StateRegistry.bin');
  getConfig().stateRegistryBytecode = bytecode;
  // Interface
  const abi = await fileHelper.readFile('StateRegistry.abi');
  getConfig().stateRegistryInterface = abi;
}

module.exports = {
  loadContractAddress,
  loadNodesConfig,
  loadABI,
  loadOracleKeyfile,
  loadOraclePwd,
  loadOracleNode,
  loadStateRegistryMetadata,
  getConfig,
  setConfig,
};
