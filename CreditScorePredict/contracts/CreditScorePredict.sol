pragma solidity 0.5.0;

import "./provableAPI.sol";

contract CreditScorePredict is usingProvable {

    uint256 public creditScoreValue;

    event LogNewScore(uint256 _creditScore);
    event LogNewProvableQuery(string _description);

    constructor()
        public
    {
        fetchCreditScoreViaProvable();
    }

    function fetchCreditScoreViaProvable()
        public
        payable
    {
        emit LogNewProvableQuery("Provable query in-flight!");
        provable_query(
            "URL",
            "json(https://api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.0"
        );
    }

    function __callback(
        bytes32 _queryID,
        string memory _result,
        bytes memory _proof
    )
        public
    {
        require(msg.sender == provable_cbAddress());
        creditScoreValue = parseInt(_result, 2);
        emit LogNewScore(creditScoreValue);
    }

}
