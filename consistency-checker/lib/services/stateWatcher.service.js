// stateWatcher.service.js

const web3Service = require('../services/web3.service');
const configService = require('../services/config.service');
const stateRepository = require('../repositories/state.repository');
const log = require('../helpers/log.helper');

const SLEEP_TIME = 3000;
const receivedCheckpoints = {};

function checkStateOnEveryNode(blockNumber, lastState) {
  const nodes = configService.getConfig().permissionedNodes;
  const total = nodes.length;
  let acc = 0;
  nodes.forEach((node) => {
    if (stateRepository.readState(node.publicKey, blockNumber) === lastState) {
      acc += 1;
    }
  });
  if (total === acc) {
    return true;
  }
  return false;
}

function watchStateChanges() {
  stateRepository.stateUpdateEmitter.on('updateState', (nodePublicKey, blockNumber, state) => {
    if (!receivedCheckpoints[blockNumber]) {
      receivedCheckpoints[blockNumber] = 1;
    } else {
      receivedCheckpoints[blockNumber] += 1;
    }

    if (receivedCheckpoints[blockNumber] === 1) {
      setTimeout(() => {
        const nodes = configService.getConfig().permissionedNodes;
        const total = nodes.length;
        if (receivedCheckpoints[blockNumber] === total) {
          if (checkStateOnEveryNode(blockNumber, state)) {
            log.info('SUCCESS! Checkpoint achieved, smart contract state is consistent through permissioned nodes.');
            web3Service.addNewStateToRegistry(blockNumber, state, true);
          } else {
            log.info('DANGER! Checkpoint NOT achieved, smart contract state is NOT consistent through permissioned nodes.');
            web3Service.addNewStateToRegistry(blockNumber, state, false);
          }
        } else {
          log.info('DANGER! Checkpoint NOT achieved, smart contract state is NOT consistent through permissioned nodes.');
          web3Service.addNewStateToRegistry(blockNumber, state, false);
        }
      }, SLEEP_TIME);
    }
  });
}


module.exports = {
  watchStateChanges,
};
