// state.repository.js

const EventEmitter = require('events');
const log = require('../helpers/log.helper');

// States store
const statemaps = {};
// Latest blocknumber of each node
const latestBlock = {};


// Event of state updates
class StateUpdateEmitter extends EventEmitter { }
const stateUpdateEmitter = new StateUpdateEmitter();
// Register error listener
stateUpdateEmitter.on('error', () => {
  throw new Error('Unexpected error related to EventEmitter. Try again please.');
});


function getStateMap(nodePublicKey) {
  return statemaps[nodePublicKey];
}

function getLatestBlock(nodePublicKey) {
  return latestBlock[nodePublicKey];
}

function initStateRepositoryForNode(nodePublicKey) {
  statemaps[nodePublicKey] = {};
}

function addState(nodePublicKey, blockNumber, state) {
  getStateMap(nodePublicKey)[blockNumber] = state;
  log.info(`State update at #${blockNumber} by ${nodePublicKey}: ${state}`);
  // Emit event
  stateUpdateEmitter.emit('updateState', nodePublicKey, blockNumber, state);
}


function readState(nodePublicKey, blockNumber) {
  // Read lastest state
  if (!blockNumber) {
    return getStateMap(nodePublicKey)[Number(getLatestBlock(nodePublicKey))];
  }
  // Read state at specific block number
  return getStateMap(nodePublicKey)[Number(blockNumber)];
}


module.exports = {
  stateUpdateEmitter,
  initStateRepositoryForNode,
  addState,
  readState,
};
