// command.controller.js

/* eslint-disable no-unused-vars */


const yargs = require('yargs');
const log = require('../helpers/log.helper');
const configService = require('../services/config.service');

// Argv arguments
let currentArgs;

function initCommand() {
  const { argv } = yargs
    .usage('consistency-checker, quorum tool to check the private contract consistency.\n\n'
      + 'Usage: consistency-checker -a [contract_target_address] -i [contract_target_abi_file]'
      + ' -f [nodes_file] -k [oracle_account_keyfile] -p [oracle_account_password]')
    .version().alias('v', 'version')
    .help('help')
    .alias('h', 'help')
    .options({
      a: {
        required: true,
        requiresArg: true,
        alias: 'address',
        describe: 'Add smart contract address to check consistency for',
        string: true,
      },
      i: {
        required: true,
        requiresArg: true,
        alias: 'interface',
        describe: 'Select a file to retrive the smart contract\'s interface (ABI) to check consistency for',
        string: true,
      },
      f: {
        required: true,
        requiresArg: true,
        alias: 'file',
        describe: 'Select a file (JSON) to retrive information about node and contract permissioning',
        string: true,
      },
      k: {
        required: true,
        requiresArg: true,
        alias: 'keyfile',
        describe: 'Select the keyfile (JSON) of the oracle node\'s account',
        string: true,
      },
      p: {
        required: true,
        requiresArg: true,
        alias: 'password',
        describe: 'Pass the password to unlock the oracle node\'s account',
        string: true,
      },
    });
  this.currentArgs = argv;
  log.info('Initializing Consistency-Checker tool...');

  log.info(`Selected smart contract address: ${argv.a}`);
  log.info(`Selected file with smart contract's interface (ABI): ${argv.i}`);
  log.info(`Selected file with permissionined nodes information: ${argv.f}`);
  log.info(`Selected keyfile of the oracle's account: ${argv.k}`);
}

function getAddress() {
  return this.currentArgs.a;
}

function getInterfacePath() {
  return this.currentArgs.i;
}

function getFilePath() {
  return this.currentArgs.f;
}

function getKeyfilePath() {
  return this.currentArgs.k;
}

function getKeyfilePassword() {
  return this.currentArgs.p;
}

// Check if it has the basic requirements of an address
function checkContractAddress() {
  if (!/^(0x)?[0-9a-f]{40}$/i.test(String(this.currentArgs.a))) {
    throw new Error('Contract address is not correct. Please, check arguments.');
  }
  return true;
}

function checkCorrectPermissionedNodes() {
  if (configService.getConfig().permissionedNodes.length === 0) {
    throw new Error('Provide permissioned nodes of the contract please.');
  }
  const nodes = configService.getConfig().permissionedNodes;
  const oracleNode = nodes.filter(node => node.oracleNode === 'true');
  if (oracleNode.length !== 1) {
    throw new Error('Provide just only 1 oracleNode. Check your configuration.');
  }
  return true;
}


module.exports = {
  initCommand,
  getAddress,
  getInterfacePath,
  getFilePath,
  checkContractAddress,
  checkCorrectPermissionedNodes,
  getKeyfilePath,
  getKeyfilePassword,
};
