pragma solidity ^0.4.11;

import './Presale.sol';
import './GraceToken.sol';

/**
 * @title Crowdsale
 * @dev Crowdsale is a base contract for managing a token crowdsale.
 * Crowdsales have a start and end block, where investors can make
 * token purchases and the crowdsale will assign them tokens based
 * on a token per ETH rate. Funds collected are forwarded to a wallet
 * as they arrive.
 */
contract Crowdsale {
  using SafeMath for uint256;

  // The token being sold
  //StandardToken public token;
  GraceToken public token;

  Presale public presale;

  // start and end block where investments are allowed (both inclusive)
  uint256 public startTime;
  uint256 public endTime;

  // address where funds are collected
  address public wallet;

  address public devIncentiveFund;
  address public marketIncentiveFund;

  // how many token units a buyer gets per wei
  uint256 public rate;

  // amount of raised money in wei
  uint256 public weiRaised;

  uint256 public presaleAllocation = 20 * (10**6) * (10**18);

  /**
   * event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */
  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

  event PresaleAllocation(address from, address presaleAddress, uint256 amount);
  
  function Crowdsale(uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet, address _devIncentiveFund, address _marketIncentiveFund, uint256 _presaleStartTime, uint256 _presaleEndTime) {
    require(_startTime >= now);
    require(_endTime >= _startTime);
    require(_rate > 0);
    require(_wallet != 0x0);

    devIncentiveFund = _devIncentiveFund;
    marketIncentiveFund = _marketIncentiveFund;
    token = createTokenContract();

    startTime = _startTime;
    endTime = _endTime;

    rate = _rate;
    wallet = _wallet;

    presale = new Presale(_presaleStartTime, _presaleEndTime, _rate, _wallet, address(token));
    allocatePresale();
  }

  // creates the token to be sold.
  function createTokenContract() internal returns (GraceToken) {
    return new GraceToken(devIncentiveFund, marketIncentiveFund);
  }

  // fallback function can be used to buy tokens
  function () payable {
    buyTokens(msg.sender);
  }

  // low level token purchase function
  function buyTokens(address beneficiary) payable {
    require(beneficiary != 0x0);
    require(validPurchase());

    uint256 weiAmount = msg.value;
    uint256 tokens = weiAmount.mul(rate);

    weiRaised = weiRaised.add(weiAmount);

    token.transfer(beneficiary, tokens);
    TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

    forwardFunds();
  }

  // send ether to the fund collection wallet
  // override to create custom fund forwarding mechanisms
  function forwardFunds() internal {
    wallet.transfer(msg.value);
  }

  // @return true if the transaction can buy tokens
  function validPurchase() internal constant returns (bool) {
    bool withinPeriod = now >= startTime && now <= endTime;
    bool nonZeroPurchase = msg.value != 0;
    return withinPeriod && nonZeroPurchase;
  }

  // send fund to presale contract address
  function allocatePresale() internal {
    token.transfer(address(presale), presaleAllocation);
    PresaleAllocation(this, address(presale), presaleAllocation);
  }

  // @return true if crowdsale event has ended
  function hasEnded() public constant returns (bool) {
    return now > endTime;
  }


}
