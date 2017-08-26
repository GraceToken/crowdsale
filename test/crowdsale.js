// IMPORTANT: since this test manipulates the network time, restart the network after every time you run this test
var GraceTokenCrowdsale = artifacts.require("./GraceTokenCrowdsale.sol");
var GraceToken = artifacts.require("./GraceToken.sol");

// method to set time of the network
const increaseTime = addSeconds => web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [addSeconds], id: 0});

contract('Crowdsale', function(accounts) {
  it("should put 76,000,000 GraceToken in the crowdsale contract account", function() {
    var crowdsale;
    
    return GraceTokenCrowdsale.deployed().then(function(instance) {
      crowdsale = instance;
      return instance.token();
    }).then(function(tokenAddress) {
      return GraceToken.at(tokenAddress);
    }).then(function(tokenInstance) {
      return tokenInstance.balanceOf(crowdsale.address);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 76 * (10**6) * (10**18), "76,000,000 wasn't in the crowdsale account");
    });
  });
  
  it("should not accept purchases before crowdsale starts, throw an exception instead", function() {
    return GraceTokenCrowdsale.deployed().then(function(instance) {
      return instance.sendTransaction({ from: accounts[2], value: web3.toWei(3, "ether")});
    }).then(function() {
      assert(false, "it was supposed to throw but didn't");
    }).catch(function(error) {
      if(error.toString().indexOf("VM Exception while processing transaction") != -1) {
        console.log("We were expecting an invalid transaction, we got one. Test succeeded.");
        assert(true);
      } else {
        // if the error is something else (e.g., the assert from previous promise), then we fail the test
        assert(false, error.toString());
      }
    });
  });

  it("should be able to finalize Presale", function() {
  });
  
  it("should process transactions correctly", function() {
    var crowdsale;
    var gracetoken;
    var rate;

    // Get initial balances of first and second account.
    var wallet = accounts[0];
    var account_two = accounts[1];
    
    var wallet_starting_eth_balance;
    var wallet_ending_eth_balance;
    var crowdsale_starting_token_balance;
    var crowdsale_ending_token_balance;
    var account_starting_eth_balance;
    var account_ending_eth_balance;
    var account_starting_token_balance;
    var account_ending_token_balance;

    var amount = 3;
    var token_diff;
    var eth_diff = web3.toWei(amount, "ether");

    // increase current time by 2 weeks to reach crowdsale period
    var two_weeks = 60 * 60 * 24 * 14;
    increaseTime(two_weeks);
    web3.eth.sendTransaction({from: web3.eth.accounts[2]}); // dummy transaction to trigger time increase
    
    return GraceTokenCrowdsale.deployed().then(function(instance) {
      crowdsale = instance;
      
      return crowdsale.token();
    }).then(function(tokenAddress) {
      
      return GraceToken.at(tokenAddress);
    }).then(function(tokenInstance) {
      gracetoken = tokenInstance;
      
      rate = new web3.BigNumber(3000);
      weiAmount = new web3.BigNumber(web3.toWei(amount, "ether"));
      token_diff = rate.times(weiAmount);
      
      return gracetoken.balanceOf(crowdsale.address);
    }).then(function(tokenBalance) {
      crowdsale_starting_token_balance = tokenBalance.toNumber();
      
      return gracetoken.balanceOf(account_two);
    }).then(function(tokenBalance) {
      account_starting_token_balance = tokenBalance.toNumber();
      
      return web3.eth.getBalance(wallet);
    }).then(function(walletBalance) {
      wallet_starting_eth_balance = walletBalance.toString(10);
      
      return crowdsale.sendTransaction({ from: account_two, value: web3.toWei(amount, "ether")});
    }).then(function() {
      
      return gracetoken.balanceOf(crowdsale.address);
    }).then(function(tokenBalance) {
      crowdsale_ending_token_balance = tokenBalance.toNumber();
      
      return gracetoken.balanceOf(account_two);
    }).then(function(tokenBalance) {
      account_ending_token_balance = tokenBalance.toNumber();
      
      return web3.eth.getBalance(wallet);
    }).then(function(walletBalance) {
      wallet_ending_eth_balance = walletBalance.toString(10);
      crowdsale_starting_token_balance = web3.fromWei(crowdsale_starting_token_balance, "ether");
      crowdsale_ending_token_balance = web3.fromWei(crowdsale_ending_token_balance, "ether");
      account_starting_token_balance = web3.fromWei(account_starting_token_balance, "ether");
      account_ending_token_balance = web3.fromWei(account_ending_token_balance, "ether");
      token_diff = web3.fromWei(token_diff, "ether");
    
      assert.equal(parseInt(wallet_ending_eth_balance), parseInt(wallet_starting_eth_balance) + parseInt(eth_diff), "ETH was not correctly added to the wallet account");
      assert.equal(crowdsale_ending_token_balance, crowdsale_starting_token_balance - token_diff, "Token was not correctly deducted from the crowdsale contract account");
      assert.equal(account_ending_token_balance, parseFloat(account_starting_token_balance) + parseFloat(token_diff), "Token was not correctly added to the purchaser account");
    });
  });
});
