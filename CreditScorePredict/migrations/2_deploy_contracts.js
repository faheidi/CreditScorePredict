const contracts = [ artifacts.require('./CreditScorePredict.sol') ]

module.exports = _deployer =>
  contracts.map(_contract =>
    _deployer.deploy(_contract))
