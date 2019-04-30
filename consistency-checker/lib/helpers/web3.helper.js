// web3.helper.js

const axios = require('axios');
const getWeb3Helper = require('./getWeb3.helper');
const config = require('../services/config.service');

async function getStorageState(nodeUrl, contractAddress, blockNumber) {
  return axios.post(nodeUrl, {
    jsonrpc: '2.0',
    method: 'eth_storageRoot',
    params: [contractAddress],
    id: blockNumber || '',
  });
}

async function getBlockNumber(nodeUrl) {
  return axios.post(nodeUrl, {
    jsonrpc: '2.0',
    method: 'eth_blockNumber',
    params: [],
    id: '',
  });
}

function isContractAddress(address) {
  const web3 = getWeb3Helper.getHttpProvider(config.getConfig().permissionedNodes[0].gethHttpUrl);
  if (web3.utils.isAddress(address)) {
    return true;
  }
  throw new Error(`${address} is not a valid contract address.`);
}

function checkNodesConectivity() {
  const nodes = config.getConfig().permissionedNodes;
  nodes.forEach(async (node) => {
    // TODO: Check WS connection
    getWeb3Helper.getHttpProvider(node.gethHttpUrl).eth.getBlockNumber().catch(() => {
      throw new Error('Impossible to connect with all the nodes. Each nodes should have HTTP and WS connectivity open. Please, check your connection.');
    });
  });
}


module.exports = {
  isContractAddress,
  getStorageState,
  getBlockNumber,
  checkNodesConectivity,
};
