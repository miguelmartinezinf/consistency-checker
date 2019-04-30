pragma solidity ^0.4.25;

import './Ownable.sol';
import './UpdateEmitter.sol';

contract StateRegistry is Ownable, UpdateEmitter {

    struct State {
        bytes32 value;
        bool isConsistent;
        uint256 index;
    }

    // map{blockNumber, state}
    mapping(uint => State) private stateStore;
    // int[] blockNumberArray
    uint256[] private statesIndex;

    // Oracle Account
    address private oracleAccount;

    modifier onlyOracle {
        require(msg.sender == oracleAccount, 'Operation restricted to oracle\'s account.');
        _;
    }

    constructor() public {
        oracleAccount = msg.sender;
    }

    function setOracleAccount(address _newOracleAccount) public isEmitter onlyOracle {
        oracleAccount = _newOracleAccount;
    }

    function getOracleAccount() public view returns (address resAccount) {
        return oracleAccount;
    }

    function addState(uint256 _blockNumber, bytes32 _state, bool _consistent) public isEmitter onlyOracle {
        stateStore[_blockNumber].value = _state;
        stateStore[_blockNumber].isConsistent = _consistent;
        stateStore[_blockNumber].index = statesIndex.push(_blockNumber)-1;
    }

    function getState(uint256 _blockNumber) public view returns (bytes32 resState, bool resConsistent) {
        return (stateStore[_blockNumber].value, stateStore[_blockNumber].isConsistent);
    }

    function getStatesIndex() public view returns (uint256[] resIndex) {
        return statesIndex;
    }

    function getStateAtIndex(uint256 _index) public view returns (uint256 resBlockNumber, bytes32 resState, bool resConsistent) {
        uint256 blockNumber = statesIndex[_index];
        return (blockNumber, stateStore[blockNumber].value, stateStore[blockNumber].isConsistent);
    }
}