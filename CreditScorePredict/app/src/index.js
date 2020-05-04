import Web3 from "web3";
import Chart from 'chart.js';
import creditScoreArtifact from "../../build/contracts/CreditScorePredict.json";

const App = {
  web3: null,
  account: null,
  CS: null,

  start: async function () {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = creditScoreArtifact.networks[networkId];
      this.CS = new web3.eth.Contract(
        creditScoreArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      if(accounts == null){
        alert("Null");
      }
      this.account = accounts[0];

      //this.refreshBalance();
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  refreshBalance: async function () {
    const { fetchCreditScoreViaProvable } = this.CS.methods;
    const ETH_AMOUNT = 1e16;
    const GAS_LIMIT = 3e6
    const balanceDes = await fetchCreditScoreViaProvable()
      .send({
        from: this.account,
        gas: GAS_LIMIT,
        value: ETH_AMOUNT
      })//getBalance(this.account).call();
    const { creditScoreValue } = this.CS.methods;
    const balance = await creditScoreValue().call();

    const balanceElement = document.getElementsByClassName("balance")[0];
    balanceElement.innerHTML = balance;
  },

  predictScore: async function () {
    const form = document.forms[0];
    
    const props = {};
    props[form.Postal_Code.name] = form.Postal_Code.value;
    const json = JSON.stringify(props);
    console.log(json);
    
    const { fetchCreditScoreViaProvable } = this.CS.methods;
    const ETH_AMOUNT = 1e16;
    const GAS_LIMIT = 3e6
    const balanceDes = await fetchCreditScoreViaProvable(json)
      .send({
        from: this.account,
        gas: GAS_LIMIT,
        value: ETH_AMOUNT
      })//getBalance(this.account).call();
    const { creditScoreValue } = this.CS.methods;
    const balance = await creditScoreValue().call();
    const balanceElement = document.getElementsByClassName("balance")[0];
    balanceElement.innerHTML = balance;
    //doughnut
    var ctxD = document.getElementById("doughnutChart").getContext('2d');    
    var myLineChart = new Chart(ctxD, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [850-balance,balance],
          backgroundColor: [  "#FFFFFF","#F7464A"],
          hoverBackgroundColor: ["#A8B3C5","#FF5A5E"]
        }]
      },
      options: {
        responsive: true
      }
    });
  },

  setStatus: function (message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },
};

window.App = App;

window.addEventListener("load", function () {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:9545"),
    );
  }

  App.start();
});
