# consistency-checker

**Consistency-checker enhances trust between parties involved in private smart contracts.** This tool acts as an oracle, listening to modifications of a specific private contract on every participant node and publishing the unique state of the contract at every block height on a public contract.

**Main workflow:**
1. Consistency-checker is executed targeting a smart contract X deployed privately for nodes <A, B, C>.
2. Listen to special events emitted by X when its state is updated.
3. Checks if the state of X is updated consistently on every node (A, B and C).
4. Sends the result of step 3 to a public contract in order to make this state log accessible to everyone.

## Motivation

One of the main features of Quorum Blockchain platform is privacy, allowing private transactions and smart contracts. When a private smart contract is deployed, only the selected participant nodes can interact with (e.g. read and write values).

Since this approach splits the state database into public and private parts and there is no consensus over the private database state, it does not prevent the double-spending problem. This fact is crucial as a deployed private smart contract could have a different state on every node, and there is no way to solve this problem.

Nevertheless, let see a particular scenario. A smart contract X is deployed on A, B and C nodes in a private way. Every private transaction which interacts with X is sent privately to the same nodes: A, B and C. So, X contract will be the same state on every permissioned contract's node (A, B and C). Consistency-checker tries to enhance trust between participant parties that are in the same situation as the previous one.


## Features

- Configurable private contract to check consistency for and its permissioned nodes.
- Configurable account to use for **consistency-checker** as an oracle.
- Creation of a public contract `StateRegistry.sol` to publish state updates.
- Monitoring of `UpdateState` events, emitted by every *write* function.
- Log of the target contract's update states through permissioned nodes on the console.
- Submission of update states on a public contract accessible for everyone in the network, `StateRegistry.sol`.

## Requirements

+ [Node.js](https://nodejs.org/) version 9 or higher
+ [Docker](https://www.docker.com/) version 18.02 or higher
+ [Docker Compose](https://www.docker.com/): compatible for docker-compose version 3.6.
+ [Quorum](https://github.com/jpmorganchase/quorum) It will be used the docker image `quorumengineering/quorum:2.2.3` (no need to install locally).
+ [Tessera](https://github.com/jpmorganchase/tessera) It will be used the docker image `quorumengineering/tessera:0.8` (no need to install locally).


## Usage

Consistency-checker can be executed with `Node.js` providing some options:
```Bash
cd consistency-checker
npm install
node index.js --help
```
```
consistency-checker, quorum tool to check the private contract consistency.

Usage:
consistency-checker -a [contract_target_address] -i [contract_target_abi_file] -f [nodes_file] -k [oracle_account_keyfile] -p [oracle_account_password]

Options:
  -a, --address    Add smart contract address to check consistency for
  -i, --interface  Select a file to retrive the smart contract's interface (ABI) to check consistency for
  -f, --file       Select a file (JSON) to retrive information about node and contract permissioning
  -k, --keyfile    Select the keyfile (JSON) of the oracle node's account
  -p, --password   Pass the password to unlock the oracle node's account
  -v, --version    Show version number
  -h, --help       Show help
```

The required parameters are the following:
 - `-a --address`: Address of the target smart contract, which is the contract to check consistency for.
 - `-i --interface`: Path of a file containing the interface (ABI) of the target smart contract.
 - `-k --keyfile`: Path of the keyfile (format JSON) of the account used by the oracle node.
 - `-k --password`: String with the password to unlock the oracle node keyfile.
 - `-f --file`: Path of a file containing the configuration of the node permissioning, which should have the following format:
   - An array of participant nodes of the private smart contract. Each node should be formed with this data:
     - `publickey`: Identifier which makes the quorum node unique (e.g. tessera's public key).
     - `gethHttpUrl`: Address and the port opened to accept `Http` communications.
     - `gethWsUrl`: Address and the port opened to accept `Websocket` communications.
     - `oracleNode`: Indicates if the node is used for the tool acting as an oracle. Only 1 node can be used by the oracle.

## Getting Started

The best way to understand this tool is following this detailed tutorial for a particular scenario.

Scenario:
 - There is a quorum network compound by 7 nodes ([`consistency-checker-network`](consistency-checker-network)) using tessera.
 - Smart contract `SimpleEvent.sol` is deployed privately for node 1, 2 and 3. This contract is the target contract to ensure consistency for.
 - `Consistency-checker` listen to state modifications in target contract, checks if are made on every node in the same way and publish this info in a public smart contract, called `StateRegistry.sol`.
 - `Node 1` is the node used by the tool, as an oracle, publishing state updates to `StateRegistry.sol`.
   - If state updates are the same for every node (1, 2 and 3), a consistent checkpoint is achieved and there is only 1 state to publish.
   - If state updates are not the same, the private contract `SimpleEvent.sol` has a different state on each node. In this case, the contract's state of the "oracle" node (e.g. `Node 1`) is taken as the correct one. So, the state of the private contract `SimpleEvent.sol` on `Node 1` is published in `StateRegistry.sol` indicating that checkpoint is not achieved.


Let see how it works step by step, from the network deployment to the tool execution. First of all, download this repo.

```Bash
git clone https://github.com/miguelmartinezinf/consistency-checker.git
cd consistency-checker
```

### 1. Network deployment

Get into [`consistency-checker-network`](consistency-checker-network) and run the provided script to start the network. This will deploy a network compound by 7 nodes with `Http` and `Websocket` connections open. These codes are based on [`quorum-examples`](https://github.com/jpmorganchase/quorum-examples).

```Bash
cd consistency-checker-network
./startNetwork.sh
```

If you can see `healthy` status on every container when executing `docker ps` means that everything went well. If not, wait a few minutes. Finally, if you want to stop the network later, run `./stopNetwork.sh`.

### 2. Private contract deployment

In order to deploy our target private contract and interacts with it, [`consistency-checker-contracts`](consistency-checker-contracts) have everything we need. It is a truffle project, with network configuration and some scripts to use for simplicity.

`SimpleEvent.sol` is just an example of a target contract, based on `SimpleStore.sol`. Every target contract should extend `UpdateEmitter.sol` contract and apply `isEmitter` modifier on each non-view function (non-constant as well).

```JavaScript
// SimpleEvent.sol
import './UpdateEmitter.sol';
contract SimpleEvent is UpdateEmitter {
    uint value;
    constructor(uint _value) public isEmitter {
        value = _value;
    }
    function set(uint _value) public isEmitter {
        value = _value;
    }
    function get() public view returns (uint) {
        return value;
    }
}
```
```JavaScript
// UpdateEmitter.sol
contract UpdateEmitter {
    event UpdateState(uint blockNumber, address sender, uint timestamp);
    modifier isEmitter() {
        emit UpdateState(block.number, tx.origin, block.timestamp);
        _;
    }
}
```

To deploy the target contract privately for node 1, 2 and 3, execute the following command:
```Bash
cd consistency-checker-contracts
truffle migrate --network nodeone --reset
```
*Output:*
```
Using network 'nodeone'.

Running migration: 1_initial_migration.js
  Deploying Migrations...
  ... 0x467d105052f79d11b61c2537a78494461bb14b312c235e3d9922c4d14e822aa0
  Migrations: 0x1932c48b2bf8102ba33b4a6b545c32236e342f34
Saving artifacts...
Running migration: 2_deploy_simpleevent.js
  Replacing UpdateEmitter...
  ... 0xeab6b774a71970fcc317ab71409b12770fc654e8311e5387d2c5e8213141bdbb
  UpdateEmitter: 0x1349f3e1b8d71effb47b840594ff27da7e603d17
  Replacing SimpleEvent...
  ... 0x28d644cc76370c25dc6920440d8311dbe663002f9f252703036efdc9f90095b5
  SimpleEvent: 0x9d13c6d3afe1721beef56b55d303b09e021e27ab
Saving artifacts...
```
Take note of the target contract address for later. `SimpleEvent: 0x9d13c6d3afe1721beef56b55d303b09e021e27ab`


### 3. Consistency-checker execution

It is time to use the consistency-checker tool! Check [`Usage section`](#usage) to see the main options of the command-line tool. Run the following command to start checking the consistency of `SimpleEvent.sol`. You can find all the parameters needed below.

At the beginning of the execution, it checks the initial state of the target smart contract on every node. If everything went well, you can see that the first checkpoint is achieved and the related info is sent to `StateRegistry.sol` public contract.

```Bash
cd consistency-checker
npm install
node index.js -a 0x9d13c6d3afe1721beef56b55d303b09e021e27ab -i contractInterface.json -f mynodes.json -k oracleAccount.json -p ''
```
`mynodes.json`
```
{
  "permissionedNodes": [
    {
      "publicKey": "BULeR8JyUWhiuuCMU/HLA0Q5pzkYT+cHII3ZKBey3Bo=",
      "gethHttpUrl": "http://localhost:22000",
      "gethWsUrl": "ws://localhost:23000",
      "oracleNode": "true"
    },
    {
      "publicKey": "QfeDAys9MPDs2XHExtc84jKGHxZg/aj52DTh0vtA3Xc=",
      "gethHttpUrl": "http://localhost:22001",
      "gethWsUrl": "ws://localhost:23001",
      "oracleNode": "false"
    },
    {
      "publicKey": "1iTZde/ndBHvzhcl7V68x44Vx7pl8nwx9LqnM/AfJUg=",
      "gethHttpUrl": "http://localhost:22002",
      "gethWsUrl": "ws://localhost:23002",
      "oracleNode": "false"
    }
  ]
}
```

`contractInterface.json`
```
[{"constant":false,"inputs":[{"name":"_value","type":"uint256"}],"name":"set","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_value","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"blockNumber","type":"uint256"},{"indexed":false,"name":"sender","type":"address"},{"indexed":false,"name":"timestamp","type":"uint256"}],"name":"UpdateState","type":"event"},{"constant":true,"inputs":[],"name":"get","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]
```

`oracleAccount.json`
```
{"address":"ed9d02e382b34818e88b88a309c7fe71e65f419d","crypto":{"cipher":"aes-128-ctr","ciphertext":"4e77046ba3f699e744acb4a89c36a3ea1158a1bd90a076d36675f4c883864377","cipherparams":{"iv":"a8932af2a3c0225ee8e872bc0e462c11"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"8ca49552b3e92f79c51f2cd3d38dfc723412c212e702bd337a3724e8937aff0f"},"mac":"6d1354fef5aa0418389b1a5d1f5ee0050d7273292a1171c51fd02f9ecff55264"},"id":"a65d1ac3-db7e-445d-a1cc-b6c5eeaa05e0","version":3}
```

*Output:*
```
[2019-04-30 09:19:53] info: Initializing Consistency-Checker tool...
[2019-04-30 09:19:53] info: Selected smart contract address: 0x9d13c6d3afe1721beef56b55d303b09e021e27ab
[2019-04-30 09:19:53] info: Selected file with smart contract's interface (ABI): contractInterface.json
[2019-04-30 09:19:53] info: Selected file with permissionined nodes information: mynodes.json
[2019-04-30 09:19:53] info: Selected keyfile of the oracle's account: oracleAccount.json
[2019-04-30 09:19:53] info: Configuration was successfully loaded.
[2019-04-30 09:19:53] info: Initializing StateRegistry contract...
[2019-04-30 09:20:02] info: StateRegistry deployed on network at 0xd9d64b7DC034fAfDbA5DC2902875A67b5d586420
[2019-04-30 09:20:02] info: Checking initial state of the smart contract...
[2019-04-30 09:20:02] info: State update at #65 by BULeR8JyUWhiuuCMU/HLA0Q5pzkYT+cHII3ZKBey3Bo=: 0x2d6f8a898e7dec0bb7a50e8c142be32d7c98c096ff68ed57b9b08280d9aca1ce
[2019-04-30 09:20:02] info: State update at #65 by QfeDAys9MPDs2XHExtc84jKGHxZg/aj52DTh0vtA3Xc=: 0x2d6f8a898e7dec0bb7a50e8c142be32d7c98c096ff68ed57b9b08280d9aca1ce
[2019-04-30 09:20:02] info: State update at #65 by 1iTZde/ndBHvzhcl7V68x44Vx7pl8nwx9LqnM/AfJUg=: 0x2d6f8a898e7dec0bb7a50e8c142be32d7c98c096ff68ed57b9b08280d9aca1ce
[2019-04-30 09:20:05] info: SUCCESS! Checkpoint achieved, smart contract state is consistent through permissioned nodes.
[2019-04-30 09:20:15] info: Checkpoint information saved at StateRegistry (0xee22d34c014b70a871e1a535fbcd23a7c8011a4ae70da5fdd36bd58fba9cec46)
```
### 4. State Modifications

To see how **consistency-checker** works, we are going to update the state of `SimpleEvent.sol` contract. Running the following command, we will store a different number into the contract, modifying its state.

```Bash
cd consistency-checker-contracts
truffle exec --network nodeone scripts/setValue.js
```
*Output:*
```
Using network 'nodeone'.

Getting deployed version of SimpleStorage...
Setting value to 123...
Transaction: 0xd11567fa332768a764cb3497bf90dfab00d3dffcc84da2f013119c2fa342a2d9
Finished!
```

See how **consistency-checker** listen to new state modifications of `SimpleEvent.sol`:

*Output:*
```
...
[2019-04-30 09:21:07] info: State update at #130 by QfeDAys9MPDs2XHExtc84jKGHxZg/aj52DTh0vtA3Xc=: 0x111dfeb861351a477cc7407d4260549b1c8a9afe85aae2a78f75ca4ac3f532e7
[2019-04-30 09:21:07] info: State update at #130 by BULeR8JyUWhiuuCMU/HLA0Q5pzkYT+cHII3ZKBey3Bo=: 0x111dfeb861351a477cc7407d4260549b1c8a9afe85aae2a78f75ca4ac3f532e7
[2019-04-30 09:21:07] info: State update at #130 by 1iTZde/ndBHvzhcl7V68x44Vx7pl8nwx9LqnM/AfJUg=: 0x111dfeb861351a477cc7407d4260549b1c8a9afe85aae2a78f75ca4ac3f532e7
[2019-04-30 09:21:10] info: SUCCESS! Checkpoint achieved, smart contract state is consistent through permissioned nodes.
[2019-04-30 09:21:19] info: Checkpoint information saved at StateRegistry (0xb38e4f734d4a35f540b9bb8448accb3e7faa1646219067430cf5b8187d200ee1)
```

Now, let's simulate what happens if a private transaction is sent to our target contract without the same permissioning nodes. (e.g. not for <1, 2, 3>).

The following command will send a private transaction to only Node 1 and Node 2:
```Bash
cd consistency-checker-contracts
truffle exec --network nodeone scripts/setIncosistentValue.js
```
*Output:*
```
Using network 'nodeone'.

Getting deployed version of SimpleStorage...
Setting value to 2322...
Transaction: 0xf14cbe8d926f87811751a59f2d7079768b5fa534617dafdc2e776a7afd515f66
Finished!
```

**Consistency-checker** listen to changes on `SimpleEvent.sol` and detects that it has not the same state on every node. As you can see, only two nodes of 3 updated the contract's state, so `SimpleEvent.sol` is not consistent through permissioned nodes.

*Output:*
```
[2019-04-30 09:22:06] info: State update at #189 by QfeDAys9MPDs2XHExtc84jKGHxZg/aj52DTh0vtA3Xc=: 0x566e43aa8937f99d92d5b40657f3942ab233b00e9928ffad6bbddce86d530ded
[2019-04-30 09:22:06] info: State update at #189 by BULeR8JyUWhiuuCMU/HLA0Q5pzkYT+cHII3ZKBey3Bo=: 0x566e43aa8937f99d92d5b40657f3942ab233b00e9928ffad6bbddce86d530ded
[2019-04-30 09:22:09] info: DANGER! Checkpoint NOT achieved, smart contract state is NOT consistent through permissioned nodes.
[2019-04-30 09:22:18] info: Checkpoint information saved at StateRegistry (0xba78c711e6207377d4fb1fadcb5841da4b1027c69b223a8a00208a52c626c162)
```

### 5. Getting the state log

**Consistency-checker** was publishing the states of `SimpleEvent.sol` contract from the `Node 1` (e.g. oracle node) point of view. This state log is accessible to everyone in the network, as `StateRegistry.sol` is a public contract.

To see the stored states on this log, just run the following command. Note that in this case we are using `Node 4` to see the public state updates, but we can use any of the network's node.
```Bash
cd consistency-checker-contracts
truffle exec --network nodefour scripts/seeStateLog.js 0xd9d64b7DC034fAfDbA5DC2902875A67b5d586420
```
*Output:*
```
Using network 'nodefour'.

Getting deployed version of StateRegistry...
Checkpoint achieved: 0x2d6f8a898e7dec0bb7a50e8c142be32d7c98c096ff68ed57b9b08280d9aca1ce state at #65
Checkpoint achieved: 0x111dfeb861351a477cc7407d4260549b1c8a9afe85aae2a78f75ca4ac3f532e7 state at #130
Checkpoint NOT achieved: 0x566e43aa8937f99d92d5b40657f3942ab233b00e9928ffad6bbddce86d530ded state at #189
```

## Contributors

* **Miguel Martinez** - *Initial work* - [miguelmartinezinf](https://github.com/miguelmartinezinf)

See also the list of [contributors](https://github.com/miguelmartinezinf/consistency-checker/contributors) who participated in this project.



## License

MIT License

Copyright (c) 2019 Miguel Martinez Arias

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details