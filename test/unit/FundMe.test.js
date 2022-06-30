const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe1", async function () {
      let fundMe, deployer, mockV3Aggregator;

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("Constructor", async function () {
        it("Set the aggregator address correctly", async function () {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("Fund", async function () {
        it("Fund", async function () {
          const response = await fundMe.fund({
            value: ethers.utils.parseEther("1"),
          });
          assert.equal(
            ethers.utils.parseEther("1").toString(),
            (await fundMe.getAddressToAmountFunded(deployer)).toString()
          );
        });
      });

      describe("Fund", async function () {
        it("Fails if you dont send enough ETH", async function () {
          await expect(fundMe.fund()).to.be.revertedWith("Not enough");
        });
      });

      describe("Withdraw", async function () {
        beforeEach(async function () {
          await fundMe.fund({ value: ethers.utils.parseEther("1") });
        });

        it("withdraw eth from a single funder", async function () {
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;

          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });

        it("withdraw eth from wrong account", async function () {
          const account = await ethers.getSigners();

          const fundMeConnectedContract = await fundMe.connect(account[1]);

          await expect(fundMeConnectedContract.withdraw()).to.be.revertedWith(
            "FundMe__NotOwner"
          );
        });

        it("allows us to withdraw from multiple getfunders", async function () {
          const account = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(account[i]);
            await fundMeConnectedContract.fund({
              value: ethers.utils.parseEther("1"),
            });
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;

          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );

          await expect(fundMe.getFunders(0)).to.be.reverted;

          for (i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(account[i].address),
              0
            );
          }
        });
      });

      describe("Array", async function () {
        it("Set getfunders in array", async function () {
          await fundMe.fund({
            value: ethers.utils.parseEther("1"),
          });
          const response = await fundMe.getFunders([0]);
          assert.equal(response, deployer);
        });
      });

      describe("owner", async function () {
        it("confirm owner address", async function () {
          const response = await fundMe.getOwner();
          assert.equal(response, deployer);
        });
      });

      describe("Cheaper Withdraw", async function () {
        beforeEach(async function () {
          await fundMe.fund({ value: ethers.utils.parseEther("1") });
        });

        it("withdraw eth from a single funder", async function () {
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;

          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });

        it("withdraw eth from wrong account", async function () {
          const account = await ethers.getSigners();

          const fundMeConnectedContract = await fundMe.connect(account[1]);

          await expect(
            fundMeConnectedContract.cheaperWithdraw()
          ).to.be.revertedWith("FundMe__NotOwner");
        });

        it("allows us to withdraw from multiple getfunders", async function () {
          const account = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(account[i]);
            await fundMeConnectedContract.fund({
              value: ethers.utils.parseEther("1"),
            });
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;

          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );

          await expect(fundMe.getFunders(0)).to.be.reverted;

          for (i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(account[i].address),
              0
            );
          }
        });
      });
    });
