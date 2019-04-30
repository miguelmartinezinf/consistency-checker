// web3.service.js

const EventEmitter = require('events');
const EthereumTx = require('ethereumjs-tx');
const keythereum = require('keythereum');

const configService = require('../services/config.service');
const getWeb3Helper = require('../helpers/getWeb3.helper');
const log = require('../helpers/log.helper');


// Event of contract deployment
class StateRegistryDeployed extends EventEmitter { }
const stateRegistryDeployed = new StateRegistryDeployed();
// Register error listener
stateRegistryDeployed.on('error', () => {
  throw new Error('Unexpected error related to StateRegistryDeployed. Try again please.');
});


function getOracleGethUrl() {
  return configService.getConfig().oracleNode.gethHttpUrl;
}

function getOracleKeyfile() {
  return configService.getConfig().oracleKeyfile;
}

function getOraclePwd() {
  return configService.getConfig().oraclePwd;
}

function getStateRegistryAddress() {
  return configService.getConfig().stateRegistryAddress;
}

function setStateRegistryAddress(stateRegistryAddress) {
  configService.getConfig().stateRegistryAddress = stateRegistryAddress;
  // Emit event stateRegistry address added
  stateRegistryDeployed.emit('stateRegistryDeployed');
}

async function getStateRegistryInterface() {
  return configService.getConfig().stateRegistryInterface;
}

async function getStateRegistryBytecode() {
  return configService.getConfig().stateRegistryBytecode;
}

async function deployStateRegistry() {
  // StateRegistry metadata
  const abi = await getStateRegistryInterface();
  const bytecode = await getStateRegistryBytecode();
  // Oracle's keyfile info
  const oracleGethUrl = getOracleGethUrl();
  const keyfileAccount = getOracleKeyfile();
  const passwordAccount = getOraclePwd();

  const web3Instance = getWeb3Helper.getHttpProvider(oracleGethUrl);
  const sContract = new web3Instance.eth.Contract(abi);
  const initialized = sContract.deploy({ data: bytecode }).encodeABI();
  const decryptedAccount = web3Instance.eth.accounts.decrypt(keyfileAccount, passwordAccount);

  // Define transaction parameters
  const txnParams = {
    gasPrice: 0,
    gasLimit: 4300000,
    to: '',
    value: 0,
    data: initialized,
    from: decryptedAccount,
  };
  const account = `0x${keyfileAccount.address}`;
  txnParams.nonce = await web3Instance.eth.getTransactionCount(account);
  const tx = new EthereumTx(txnParams);
  tx.sign(keythereum.recover(passwordAccount, keyfileAccount));
  const rawTx = `0x${tx.serialize().toString('hex')}`;
  web3Instance.eth.sendSignedTransaction(rawTx).on('receipt', (receipt) => {
    log.info(`StateRegistry deployed on network at ${receipt.contractAddress}`);
    setStateRegistryAddress(receipt.contractAddress);
  }).on('error', () => {
    throw new Error('Encountered problem with StateRegistry contract.');
  });
}

async function addNewStateToRegistry(blockNumber, state, isConsistent) {
  const abi = await getStateRegistryInterface();
  // Oracle's keyfile info
  const oracleGethUrl = getOracleGethUrl();
  const keyfileAccount = getOracleKeyfile();
  const passwordAccount = getOraclePwd();

  const contractAddress = getStateRegistryAddress();
  if (!contractAddress) {
    throw new Error('Encountered problem with StateRegistry contract.');
  }

  const web3Instance = getWeb3Helper.getHttpProvider(oracleGethUrl);
  const contract = new web3Instance.eth.Contract(abi, contractAddress);
  const encodedTx = contract.methods.addState(blockNumber, state, isConsistent).encodeABI();
  // Build decrypted account in order to sign
  const decryptedAccount = web3Instance.eth.accounts.decrypt(keyfileAccount, passwordAccount);

  const txnParams = {
    gasPrice: 0,
    gasLimit: 4300000,
    to: contractAddress,
    value: 0,
    data: encodedTx,
    from: decryptedAccount,
  };
  const account = `0x${keyfileAccount.address}`;
  txnParams.nonce = await web3Instance.eth.getTransactionCount(account);
  const tx = new EthereumTx(txnParams);
  tx.sign(keythereum.recover(passwordAccount, keyfileAccount));

  const rawTx = `0x${tx.serialize().toString('hex')}`;
  web3Instance.eth.sendSignedTransaction(rawTx)
    .on('receipt', (receipt) => {
      if (receipt.status !== true) {
        throw new Error('Encountered problem connecting with StateRegistry.');
      }
      log.info(`Checkpoint information saved at StateRegistry (${receipt.transactionHash})`);
    });
}


module.exports = {
  stateRegistryDeployed,
  deployStateRegistry,
  addNewStateToRegistry,
};
