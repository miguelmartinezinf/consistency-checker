pragma solidity ^0.4.25;

contract UpdateEmitter {

    event UpdateState(
        uint blockNumber,
        address sender,
        uint timestamp
    );

    modifier isEmitter() {
        emit UpdateState(block.number, tx.origin, block.timestamp);
        _;
    }
}