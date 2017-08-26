pragma solidity ^0.4.15;

import '../lib/Ownable.sol';
import '../lib/SafeMath.sol';
import './GraceToken.sol';

/**
 * @title Presale
 * @dev Presale is a base contract for managing a token Presale.
 * Crowdsales have a start and end block, where investors can make
 * token purchases and the Presale will assign them tokens based
 * on a token per ETH rate. Funds collected are forwarded to a wallet
 * as they arrive.
 */
contract Presale is Ownable {
  using SafeMath for uint256;

  bool public isFinalized = false;

  // The token being sold
  GraceToken public token;

  uint256 public startTime;
  uint256 public endTime;

  // address where funds are collected
  address public wallet;

  address public crowdsale;

  // how many token units a buyer gets per wei
  uint256 public rate;

  // amount of raised money in wei
  uint256 public weiRaised;

  /**
   * event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */
  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

  event Finalized();

  function Presale(uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet, address tokenAddress) {
    require(_startTime >= now);
    require(_endTime >= _startTime);

    require(_rate > 0);
    require(_wallet != 0x0);

    token = GraceToken(tokenAddress);
    startTime = _startTime;
    endTime = _endTime;
    rate = _rate;
    wallet = _wallet;

    crowdsale = msg.sender;
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

    // extra 20% tokens during presale
    uint256 bonus = tokens.div(5);
    tokens = tokens.add(bonus);

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

  // @return true if presale event has ended
  function hasEnded() public constant returns (bool) {
    return now > endTime;
  }

  /**
   * @dev Must be called after presale ends, to do some extra finalization
   * work. Calls the contract's finalization function.
   */
  function finalize() onlyOwner {
    require(!isFinalized);
    
    finalization();
    Finalized();
    
    isFinalized = true;
  }

  /**
   * @dev Finalization logic: reallocate all unsold tokens at the end of the presale.
   */
  function finalization() internal {
    uint256 balance = token.balanceOf(this);
    token.transfer(crowdsale, balance);
  }
}
