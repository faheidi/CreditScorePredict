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
        request("json(QmZRjkL4U72XFXTY8MVcchpZciHAwnTem51AApSj6Z2byR).XETHZUSD.c.0",
                "GET",
                "https://api.kraken.com/0/public/Ticker?pair=ETHUSD",
                "{'headers': {'content-type': 'json'}}"
                );
        // emit LogNewProvableQuery("Provable query in-flight!");
        // provable_query(
        //     "URL",
        //     "json(https://api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.0",{'headers': {'content-type': 'json'},"Postal_Code_" : "H3V1A2"}'
        // );
    }

    function request(
        string memory _query,
        string memory _method,
        string memory _url,
        string memory _kwargs
    )
        public
        payable
    {
            emit LogNewProvableQuery("Provable query was sent, standing by for the answer...");
            provable_query("computation",
                [_query,
                _method,
                _url,
                _kwargs]
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
