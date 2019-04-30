// getWeb3.helper.js

const Web3 = require('web3');

function getHttpProvider(gethHttpUrl) {
  const options = {
    transactionConfirmationBlocks: 1,
  };
  return new Web3(new Web3.providers.HttpProvider(gethHttpUrl), null, options);
}

function getWsProvider(gethWsUrl) {
  return new Web3(new Web3.providers.WebsocketProvider(gethWsUrl));
}


module.exports = {
  getHttpProvider,
  getWsProvider,
};
