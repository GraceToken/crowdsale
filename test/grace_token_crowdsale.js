// NOTE: a contract cannot be finalized twice
var GraceTokenCrowdsale = artifacts.require("./GraceTokenCrowdsale.sol");
var GraceToken = artifacts.require("./GraceToken.sol");
var Presale = artifacts.require("./Presale.sol");

contract('GraceTokenCrowdsale', function(accounts) {
  it("should reallocate unsold tokens from presale to main crowdsale", function() {
  	var crowdsale;
	var tokenAddress;
	var token;
	var presaleAddress;
	var presale;
	var crowdsaleBalance;
	var presaleBalance;

  	return GraceTokenCrowdsale.deployed().then(function(instance) {
		crowdsale = instance;
		return crowdsale.token();
	}).then(function(addr) {
		tokenAddress = addr;
		return GraceToken.at(tokenAddress);
	}).then(function(tokenInstance) {
		token = tokenInstance;
		return crowdsale.presale();
	}).then(function(addr) { 
		presaleAddress = addr;
		return Presale.at(presaleAddress);
	}).then(function(presaleInstance) {
		presale = presaleInstance;
		return crowdsale.finalizePresale();
	}).then(function() {
		return token.balanceOf(presale.address);
	}).then(function(balance) {
		presaleBalance = balance.toString();
		return token.balanceOf(crowdsale.address);
	}).then(function(balance) {
		crowdsaleBalance = balance.toString();
		
		assert.equal(presaleBalance, 0);
		assert.equal(crowdsaleBalance, 96 * (10**6) * (10**18));
	});
  });  

  it("should reallocate unsold tokens at the end of the crowdsale", function() {
  	var crowdsale;
	var tokenAddress;
	var token;
	var crowdsaleBalance;
	var ownerBalance;

  	return GraceTokenCrowdsale.deployed().then(function(instance) {
		crowdsale = instance;
		return crowdsale.token();
	}).then(function(addr) {
		tokenAddress = addr;
		return GraceToken.at(tokenAddress);
	}).then(function(tokenInstance) {
		token = tokenInstance;
		return crowdsale.finalize();
	}).then(function() {
		return token.balanceOf(accounts[0]);
	}).then(function(balance) {
		ownerBalance = balance.toString();
		return token.balanceOf(crowdsale.address);
	}).then(function(balance) {
		crowdsaleBalance = balance.toString();

		assert.equal(crowdsaleBalance, 0);
		assert.equal(ownerBalance, 96 * (10**6) * (10**18));
	});
  });
});
