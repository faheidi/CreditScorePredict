pragma solidity 0.5.0;

import "./provableAPI.sol";

contract CreditScorePredict is usingProvable {

    uint256 public creditScoreValue;

    event LogNewScore(uint256 _creditScore);
    event LogNewProvableQuery(string _description);

    constructor()
        public
    {
        fetchCreditScoreViaProvable('{}');
    }

    function fetchCreditScoreViaProvable(string memory json)
        public
        payable
    {
        emit LogNewProvableQuery("Provable query in-flight!");
        provable_query(
            "computation",
            "QmXy7GRHqDtgR6LApmimgfi5e3GKyww1gwMixiP6UKMQ92",
             json
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



// pragma solidity 0.5.0;

// import "./provableAPI.sol";

// contract CreditScorePredict is usingProvable {

//     uint256 public creditScoreValue;

//     event LogNewScore(uint256 _creditScore);
//     event LogNewProvableQuery(string _description);

//     constructor()
//         public
//     {
//         fetchCreditScoreViaProvable();
//     }

//     function fetchCreditScoreViaProvable()
//         public
//         payable
//     {
//         emit LogNewProvableQuery("Provable query in-flight!");
//         provable_query("computation",
//                        "QmXy7GRHqDtgR6LApmimgfi5e3GKyww1gwMixiP6UKMQ92");     
//     }

//     function __callback(
//         bytes32 _queryID,
//         string memory _result,
//         bytes memory _proof
//     )
//         public
//     {
//         require(msg.sender == provable_cbAddress());
//         creditScoreValue = parseInt(_result, 2);
//         emit LogNewScore(creditScoreValue);
//     }

// }
