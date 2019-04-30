const SimpleEvent = artifacts.require("SimpleEvent");


module.exports = function (done) {
    console.log("Getting deployed version of SimpleEvent...")
    SimpleEvent.deployed().then(function (instance) {
        console.log("Getting value ...");
        return instance.get();
    }).then(function (result) {
        console.log("Result:", result);
        console.log("Finished!");
        done();
    }).catch(function (e) {
        console.log(e);
        done();
    });
};