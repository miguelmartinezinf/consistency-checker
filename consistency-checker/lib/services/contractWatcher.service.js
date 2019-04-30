// contractWatcher.service.js

const config = require('../services/config.service');
const stateService = require('../services/state.service');
const getWeb3Helper = require('../helpers/getWeb3.helper');


function watchContractEvents() {
  const nodes = config.getConfig().permissionedNodes;
  const { contractAddress, abi } = config.getConfig();
  let web3Instance;
  nodes.forEach(async (node) => {
    web3Instance = getWeb3Helper.getWsProvider(node.gethWsUrl);
    new web3Instance.eth.Contract(abi, contractAddress).events.UpdateState({}, async (err, res) => {
      if (err) {
        throw new Error('Encountered problem watching events.');
      }
      await stateService.checkNodeStateAtBlockNumber(node, res.returnValues.blockNumber);
    });
  });
}


module.exports = {
  watchContractEvents,
};
