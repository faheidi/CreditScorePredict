const Web3 = require('web3')
const { waitForEvent } = require('./utils')
const CreditScoreContract = artifacts.require('./CreditScorePredict.sol')
const web3WithWebsockets = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:9545'))

contract('Credit Score', ([ owner ]) => {
  let contractEvents
  let contractMethods
  let contractAddress
  let CreditScoreFromContractEvent

  const GAS_LIMIT = 3e6
  const PROVABLE_QUERY_EVENT = 'LogNewProvableQuery'
  const PROVABLE_QUERY_STRING = 'Provable query in-flight!'

  it('Should get contract instantiation for listening to events', async () => {
    const { contract: deployedContract } = await CreditScoreContract.deployed()
    const { methods, events } = new web3WithWebsockets.eth.Contract(
      deployedContract._jsonInterface,
      deployedContract._address
    )
    contractEvents = events
    contractMethods = methods
    contractAddress = deployedContract._address
  })

  it('Should have logged a new Provable query on contract creation', async () => {
    const {
      returnValues: {
        _description
      }
    } = await waitForEvent(contractEvents[PROVABLE_QUERY_EVENT])
    assert(
      _description === PROVABLE_QUERY_STRING,
      'Provable query incorrectly logged!'
    )
  })

  it('Callback should have logged a new Credt Score value', async () => {
    const {
      returnValues: {
        _creditScoreValue
      }
    } = await waitForEvent(contractEvents.LogNewCreditScore)
    creditScoreValueFromContractEvent = _creditScoreValue
    assert(
      parseInt(_creditScoreValue) > 0,
      'A price should have been retrieved from Provable call!'
    )
  })

  it('Should set Credit Score Value correctly in contract', async () => {
    const creditScoreInStorage = await contractMethods
      .creditScoreValue()
      .call()
  })

  it('Should revert on second query attempt due to lack of funds', async () => {
    const contractBalance = await web3.eth.getBalance(contractAddress)
    assert(parseInt(contractBalance) === 0)
    try {
      await contractMethods
        .fetchCreditScoreViaProvable()
        .send({
          from: owner,
          gas: GAS_LIMIT
        })
    } catch (e) {
      assert(e.message.includes('revert'))
    }
  })

  it('Should succeed on a second query attempt when sending funds', async () => {
    const ETH_AMOUNT = 1e16
    contractMethods
      .fetchCreditScoreViaProvable()
      .send({
        from: owner,
        gas: GAS_LIMIT,
        value: ETH_AMOUNT
      })
    const {
      returnValues: {
        _description
      }
    } = await waitForEvent(contractEvents[PROVABLE_QUERY_EVENT])
    assert(
      _description === PROVABLE_QUERY_STRING,
      'Provable query incorrectly logged!'
    )
  })
})
