const Badge = artifacts.require("Badge");

module.exports = function (deployer) {
  console.log("deployer: ", deployer.options.from);
  console.log("====================================================================");
  deployer.deploy(Badge, deployer.options.from, "").then(ret => {
    console.log("Badget deploy: ", ret);
  });
};
