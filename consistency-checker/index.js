// index.js

const commandController = require('./lib/controllers/command.controller');
const stateService = require('./lib/services/state.service');
const configService = require('./lib/services/config.service');
const loggingService = require('./lib/services/logging.service');
const contractWatcherService = require('./lib/services/contractWatcher.service');
const stateWatcherService = require('./lib/services/stateWatcher.service');
const web3Service = require('./lib/services/web3.service');
const web3Helper = require('./lib/helpers/web3.helper');
const fileHelper = require('./lib/helpers/file.helper');
const log = require('./lib/helpers/log.helper');


async function bootstrapConfiguration() {
  // Check passed arguments
  commandController.checkContractAddress();
  await fileHelper.isPathCorrect(commandController.getFilePath());
  await fileHelper.isPathCorrect(commandController.getInterfacePath());
  await fileHelper.isPathCorrect(commandController.getKeyfilePath());

  // Load configuration of permissioned nodes
  await configService.loadNodesConfig(commandController.getFilePath());
  await configService.loadContractAddress(commandController.getAddress());
  await configService.loadABI(commandController.getInterfacePath());
  await configService.loadOracleKeyfile(commandController.getKeyfilePath());
  await configService.loadOraclePwd(commandController.getKeyfilePassword());

  // Check json file data
  commandController.checkCorrectPermissionedNodes();

  // Load oracleNode
  await configService.loadOracleNode();
  // Load StateRegistry metadata
  await configService.loadStateRegistryMetadata();

  // Check nodes connectivity
  await web3Helper.checkNodesConectivity();
  // Checks if is address
  web3Helper.isContractAddress(commandController.getAddress());
}

async function bootstrapInitialState() {
  await stateService.initStateRepositories();
  await stateService.checkAllInitialState();
}

async function bootstrapStateRegistryContract() {
  log.info('Initializing StateRegistry contract...');
  await web3Service.deployStateRegistry();
}


async function start() {
  try {
    // Init logging service
    loggingService.startLogger();

    // Read passed arguments by the user
    commandController.initCommand();

    // Check arguments and loading tool configuration
    await bootstrapConfiguration();
    log.info('Configuration was successfully loaded.');

    // Bootstrap StateRegistry contract for state uploads
    await bootstrapStateRegistryContract();

    // Wait until StateRegistry contract is deployed
    web3Service.stateRegistryDeployed.on('stateRegistryDeployed', async () => {
      // Watch state updates events
      await stateWatcherService.watchStateChanges();

      // Bootstrap state repository and check initial state
      log.info('Checking initial state of the smart contract...');
      await bootstrapInitialState();

      // Watch contract's events and updates state repositories
      await contractWatcherService.watchContractEvents();
    });
    // END listener event

    return true;
  } catch (error) {
    log.error(error);
    return false;
  }
}


// Aplication start
start();
