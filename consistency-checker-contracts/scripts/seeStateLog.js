const StateRegistry = artifacts.require("StateRegistry");

module.exports = function (done) {
    console.log("Getting deployed version of StateRegistry...");
    if (process.argv[6]) {
        const myInstance = StateRegistry.at(process.argv[6]);
        myInstance.getStatesIndex().then(function (resStates) {
            let isConsistent = 'Checkpoint achieved';
            let notConsistent = 'Checkpoint NOT achieved';
            resStates.forEach((index) => {
                myInstance.getState(new Number(index).toString()).then(function(result) {
                    console.log(`${result[1]? isConsistent : notConsistent}: ${result[0]} state at #${new Number(index).toString()}`);
                });
            })
        }).catch(function (e) {
            console.log(e);
            done();
        });
    } else {
        console.log("Error. Please, provide the address of StateRegistry.");
    }
};