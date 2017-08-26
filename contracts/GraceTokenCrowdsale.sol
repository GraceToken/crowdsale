pragma solidity ^0.4.15;

import '../lib/Ownable.sol';
import '../lib/SafeMath.sol';
import './Crowdsale.sol';

contract GraceTokenCrowdsale is Crowdsale, Ownable {
  using SafeMath for uint256;

  bool public isFinalized = false;

  event Finalized();

  function GraceTokenCrowdsale(uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet, address _devIncentiveFund, address _marketIncentiveFund, uint256 _presaleStartTime, uint256 _presaleEndTime) Crowdsale(_startTime, _endTime, _rate, _wallet, _devIncentiveFund, _marketIncentiveFund, _presaleStartTime, _presaleEndTime) {
  }

  /**
   * @dev Must be called after crowdsale ends, to do some extra finalization
   * work. Calls the contract's finalization function.
   */
  function finalize() onlyOwner {
    require(!isFinalized);
    
    finalization();
    Finalized();
    
    isFinalized = true;
  }

  /**
   * @dev Finalization logic: reallocate all unsold tokens at the end of the crowdsale.
   */
  function finalization() internal {
  	uint256 balance = token.balanceOf(this);
    token.transfer(msg.sender, balance);
  }

  /**
   * @dev Finalize presale and allocates unsold tokens from presale to the main crowdsale.
   */
  function finalizePresale() onlyOwner {
  	presale.finalize();
  }
}
