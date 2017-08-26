var GraceTokenCrowdsale = artifacts.require("./GraceTokenCrowdsale.sol")

module.exports = function(deployer, network, accounts) {
  var presaleStartTime = new Date(Date.UTC(2017, 7, 28, 0, 0));
  presaleStartTime = Math.floor(presaleStartTime / 1000);
  var presaleEndTime = new Date(Date.UTC(2017, 8, 3, 11, 59));
  presaleEndTime = Math.floor(presaleEndTime / 1000);
  var crowdsaleStartTime = new Date(Date.UTC(2017, 8, 4, 0, 0));
  crowdsaleStartTime = Math.floor(crowdsaleStartTime / 1000);
  var crowdsaleEndTime = new Date(Date.UTC(2017, 9, 16, 11, 59));
  crowdsaleEndTime = Math.floor(crowdsaleEndTime / 1000);
  
  const rate = new web3.BigNumber(3000) // rate of ether to Grace Token in wei
  const wallet = web3.eth.accounts[0] // use a multisig wallet for security, this holds the ETH collected in the crowdsale.
  const devIncentiveFund = web3.eth.accounts[1];
  const marketIncentiveFund = web3.eth.accounts[2];
  
  deployer.deploy(GraceTokenCrowdsale, crowdsaleStartTime, crowdsaleEndTime, rate, wallet, devIncentiveFund, marketIncentiveFund, presaleStartTime, presaleEndTime);
};
