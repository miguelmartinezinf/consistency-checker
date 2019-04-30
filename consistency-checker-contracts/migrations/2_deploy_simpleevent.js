const UpdateEmitter = artifacts.require("UpdateEmitter.sol");
const SimpleEvent = artifacts.require("SimpleEvent.sol");

module.exports = function(deployer) {
  deployer.deploy(UpdateEmitter, {
    privateFor: ["QfeDAys9MPDs2XHExtc84jKGHxZg/aj52DTh0vtA3Xc=", "1iTZde/ndBHvzhcl7V68x44Vx7pl8nwx9LqnM/AfJUg="]
  });
  deployer.link(UpdateEmitter, SimpleEvent);
  deployer.deploy(SimpleEvent, 24, {
    privateFor: ["QfeDAys9MPDs2XHExtc84jKGHxZg/aj52DTh0vtA3Xc=", "1iTZde/ndBHvzhcl7V68x44Vx7pl8nwx9LqnM/AfJUg="]
  });
};
