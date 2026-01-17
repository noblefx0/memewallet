// wallet.js — shared wallet logic only

let balance = localStorage.getItem("balance")
  ? Number(localStorage.getItem("balance"))
  : 10000;

let portfolio = localStorage.getItem("portfolio")
  ? JSON.parse(localStorage.getItem("portfolio"))
  : {};

// Save to localStorage
function saveWallet() {
  localStorage.setItem("balance", balance);
  localStorage.setItem("portfolio", JSON.stringify(portfolio));
}

// Update balance display on home
function updateHomeBalance() {
  const el = document.querySelector(".balance");
  if (el) {
    el.innerHTML = `$${balance.toFixed(2)}`;
  }
}

// Buy
function buyCoin(coinId, usdAmount, currentPrice) {
  if (usdAmount > balance) {
    return { success: false, message: "Not enough balance!" };
  }

  const coinsBought = usdAmount / currentPrice;

  balance -= usdAmount;

  if (!portfolio[coinId]) {
    portfolio[coinId] = { amount: 0 };
  }

  portfolio[coinId].amount += coinsBought;

  saveWallet();
  updateHomeBalance(); // <-- add this line

  return { success: true, message: `Bought ${coinsBought.toFixed(4)} of ${coinId.toUpperCase()}` };
}

// Sell: sell coins for USD
function sellCoin(coinId, coinAmount, currentPrice) {
  if (isNaN(coinAmount) || coinAmount <= 0) {
    return { success: false, message: "Invalid amount" };
  }

  if (!portfolio[coinId] || portfolio[coinId].amount < coinAmount) {
    return { success: false, message: "Not enough coins!" };
  }

  const usdReceived = coinAmount * currentPrice;

  balance += usdReceived;
  portfolio[coinId].amount -= coinAmount;

  // Remove coin completely if amount reaches 0
  if (portfolio[coinId].amount <= 0.000001) {  // small threshold for floating point
    delete portfolio[coinId];
  }

  saveWallet();
  updateHomeBalance();

  return { success: true, message: `Sold ${coinAmount.toFixed(4)} of ${coinId}` };
}

window.addEventListener("pageshow", () => {
  updateHomeBalance();  // refresh balance when coming back from buy-sell
});
updateHomeBalance(); // initial load
