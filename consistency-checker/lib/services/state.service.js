// state.service.js

const BigNumber = require('bignumber.js');

const config = require('../services/config.service');
const stateRepository = require('../repositories/state.repository');
const web3Helper = require('../helpers/web3.helper');


async function initStateRepositories() {
  const nodes = config.getConfig().permissionedNodes;
  nodes.forEach(async (node) => {
    stateRepository.initStateRepositoryForNode(node.publicKey);
  });
}

async function checkNodeStateAtBlockNumber(node, blockNumber) {
  const state = await web3Helper.getStorageState(node.gethHttpUrl, config.getConfig().contractAddress, new BigNumber(blockNumber).toNumber());
  stateRepository.addState(node.publicKey, new BigNumber(state.data.id).toNumber(), state.data.result);
}

async function checkAllInitialState() {
  const nodes = config.getConfig().permissionedNodes;
  const blockNumberReq = await web3Helper.getBlockNumber(nodes[0].gethHttpUrl);
  const blockNumber = blockNumberReq.data.result;
  await nodes.forEach(async (node) => {
    await checkNodeStateAtBlockNumber(node, blockNumber);
  });
}


module.exports = {
  initStateRepositories,
  checkAllInitialState,
  checkNodeStateAtBlockNumber,
};
