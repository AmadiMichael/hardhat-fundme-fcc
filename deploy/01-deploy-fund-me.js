const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { network, deployments } = require("hardhat");
const { verify } = require("../utils/verify");

//let ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  const args = [ethUsdPriceFeedAddress];

  const fundme = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (!developmentChains.includes(network.name)) {
    await verify(fundme.address, args);
  }
  log(
    "________________________________________________________________________"
  );
};

module.exports.tags = ["all", "fundme"];
