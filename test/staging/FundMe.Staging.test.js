const { assert } = require("chai");
const { network, getNamedAccounts, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe, deployer;
      let sendValue = ethers.utils.parseEther("0.01");
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("allows people to fund and withdraw", async function () {
        console.log(
          (await fundMe.provider.getBalance(fundMe.address)).toString()
        );
        const funded = await fundMe.fund({ value: sendValue });
        await funded.wait(1);
        await fundMe.withdraw();
        const endingBalance = await fundMe.provider.getBalance(fundMe.address);
        console.log(endingBalance);
        assert.equal(endingBalance.toString(), "0");
      });
    });
