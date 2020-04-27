App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:9545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("CreditScore.json", function(credit) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.CreditScore = TruffleContract(credit);
      // Connect provider to interact with contract
      App.contracts.CreditScore.setProvider(App.web3Provider);

      App.listenForEvents();

      //return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.CreditScore.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },

  render: function() {
    var creditInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.CreditScore.deployed().then(function(instance) {
      creditInstance = instance;
      return creditInstance.creditOwner();
    }).then(function(creditScore) {
      loader.hide();
      content.show();
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();
      var candidateTemplate = "<tr><th>" + "H3V1A5" + "</th><td>" + "" + "</td><td>" + creditScore + "</td><td>"+570+"</td> </tr>"
      candidatesResults.append(candidateTemplate);
      var candidateOption = "<option value='" + "1" + "' >" + "2" + "</ option>"
      candidatesSelect.append(candidateOption);
      return creditInstance.voters(App.account);
    }).catch(function(error) {
      console.warn(error);
    });
  },

    castVote: function() {
    return App.render();
  },
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});















