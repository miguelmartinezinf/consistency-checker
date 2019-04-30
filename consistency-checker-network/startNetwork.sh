#!/bin/bash

QUORUM_GETH_ARGS="--rpccorsdomain https://remix.ethereum.org --ws --wsaddr 0.0.0.0 --wsport 9545 --wsorigins='*' --wsapi admin,db,eth,debug,miner,net,shh,txpool,personal,web3,quorum" docker-compose -f docker-compose.yml up -d
