// wallet.js - shared fake wallet logic

let balance = localStorage.getItem("balance")
  ? Number(localStorage.getItem("balance"))
  : 10000;

let portfolio = localStorage.getItem("portfolio")
  ? JSON.parse(localStorage.getItem("portfolio"))
  : {};

function saveWallet() {
  localStorage.setItem("balance", balance);
  localStorage.setItem("portfolio", JSON.stringify(portfolio));
}

function updateHomeBalance() {
  const balanceEl = document.querySelector(".balance");
  if (balanceEl) {
    balanceEl.innerHTML = `$${balance.toFixed(2)}`;
  }
}

function buyCoin(coinId, usdAmount, currentPrice) {
  if (isNaN(usdAmount) || usdAmount <= 0) {
    return { success: false, message: "Invalid amount!" };
  }

  if (usdAmount > balance) {
    return { success: false, message: "Not enough balance!" };
  }

  const coinsBought = usdAmount / currentPrice;
  if (isNaN(coinsBought)) {
    return { success: false, message: "Invalid price calculation!" };
  }

  balance -= usdAmount;

  if (!portfolio[coinId]) {
    portfolio[coinId] = { amount: 0, totalCost: 0 };
  }

  portfolio[coinId].amount += coinsBought;
  portfolio[coinId].totalCost += usdAmount;

  saveWallet();
  updateHomeBalance();

  return { success: true, message: `Bought ${coinsBought.toFixed(4)} ${coinId.toUpperCase()}` };
}

function sellCoin(coinId, coinAmount, currentPrice) {
  if (isNaN(coinAmount) || coinAmount <= 0) {
    return { success: false, message: "Invalid amount!" };
  }

  if (!portfolio[coinId] || portfolio[coinId].amount < coinAmount) {
    return { success: false, message: "Not enough coins to sell!" };
  }

  const usdReceived = coinAmount * currentPrice;
  if (isNaN(usdReceived)) {
    return { success: false, message: "Invalid price calculation!" };
  }

  balance += usdReceived;
  portfolio[coinId].amount -= coinAmount;

  if (portfolio[coinId].amount <= 0) {
    delete portfolio[coinId];
  }

  saveWallet();
  updateHomeBalance();

  return { success: true, message: `Sold ${coinAmount.toFixed(4)} ${coinId.toUpperCase()}` };
}

// Export for use in other files (if using modules later)
