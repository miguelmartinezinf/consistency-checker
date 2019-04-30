pragma solidity ^0.4.25;

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

