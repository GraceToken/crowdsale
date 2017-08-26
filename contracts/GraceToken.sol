pragma solidity ^0.4.15;

import '../lib/StandardToken.sol';
import '../lib/SafeMath.sol';

contract GraceToken is StandardToken {
  using SafeMath for uint256;

  string public constant name = "Grace Token";
  string public constant symbol = "GRCE";
  uint256 public constant decimals = 18;
  string public version = '0.1';
  
  // addresses for allocation
  address public devIncentiveFund;
  address public marketIncentiveFund;
  address public crowdsaleAddress;

  function GraceToken(
    address _devIncentiveFund,
    address _marketIncentiveFund
    ) {
    crowdsaleAddress = msg.sender;
    devIncentiveFund = _devIncentiveFund;
    marketIncentiveFund = _marketIncentiveFund;
    
    totalSupply = 120 * (10**6) * 10**decimals; // 120M GRCE tokens
    balances[devIncentiveFund] = 6 * (10**6) * 10**decimals;
    balances[marketIncentiveFund] = 18 * (10**6) * 10**decimals;
    balances[crowdsaleAddress] = 96 * (10**6) * 10**decimals;  // including 20M for presale contract
  }
}
