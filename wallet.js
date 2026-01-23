// wallet.js — shared wallet logic only (no page-specific code)

// Globals — no 'let' so they are shared
balance = localStorage.getItem("balance")
  ? Number(localStorage.getItem("balance"))
  : 10000;

portfolio = localStorage.getItem("portfolio")
  ? JSON.parse(localStorage.getItem("portfolio"))
  : {};

// Save to localStorage
function saveWallet() {
  localStorage.setItem("balance", balance);
  localStorage.setItem("portfolio", JSON.stringify(portfolio));
}

// Update balance display on home (safe — checks if element exists)
async function updateHomeBalance() {
  const balanceEl = document.querySelector(".balance");
  const totalEl = document.getElementById("totalWorth");

  const portfolioValue = await getPortfolioValue();
  const totalWorth = balance + portfolioValue;

  if (balanceEl) {
    balanceEl.innerHTML = `$${balance.toFixed(2)}`;
  }

  if (totalEl) {
    totalEl.innerHTML = `Total Worth: $${totalWorth.toFixed(2)}`;
  }
}

// Buy
function buyCoin(coinId, usdAmount, currentPrice) {
  if (isNaN(usdAmount) || usdAmount <= 0) {
    return { success: false, message: "Invalid amount" };
  }

  if (usdAmount > balance) {
    return { success: false, message: "Not enough balance!" };
  }

  if (isNaN(currentPrice) || currentPrice <= 0) {
    return { success: false, message: "Invalid price" };
  }

  const coinsBought = usdAmount / currentPrice;

  balance -= usdAmount;

  if (!portfolio[coinId]) {
    portfolio[coinId] = { amount: 0, totalCost: 0 };
  }

  portfolio[coinId].amount += coinsBought;
  portfolio[coinId].totalCost += usdAmount;
  portfolio[coinId].lastPrice = currentPrice;  // add this after totalCost

  saveWallet();
  updateHomeBalance();

  return { success: true, message: `Bought ${coinsBought.toFixed(4)} ${coinId}` };
}

// Sell
function sellCoin(coinId, coinAmount, currentPrice) {
  if (isNaN(coinAmount) || coinAmount <= 0) {
    return { success: false, message: "Invalid amount" };
  }

  if (!portfolio[coinId] || portfolio[coinId].amount < coinAmount) {
    return { success: false, message: "Not enough coins!" };
  }

  if (isNaN(currentPrice) || currentPrice <= 0) {
    return { success: false, message: "Invalid price" };
  }

  const usdReceived = coinAmount * currentPrice;

  balance += usdReceived;
  portfolio[coinId].amount -= coinAmount;

  if (portfolio[coinId].amount <= 0.000001) {
    delete portfolio[coinId];
  }

  saveWallet();
  updateHomeBalance();

  return { success: true, message: `Sold ${coinAmount.toFixed(4)} ${coinId}` };
} 

// Calculate total USD value of all meme holdings (live prices)
async function getPortfolioValue() {
  let total = 0;

  for (const ca in portfolio) {
    const holding = portfolio[ca];
    if (holding.amount < 0.000001) continue;

    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${ca}`);
      const data = await response.json();

      if (data.pairs && data.pairs.length > 0) {
        const pair = data.pairs[0];
        const currentPrice = Number(pair.priceUsd);
        total += holding.amount * currentPrice;
      }
    } catch (error) {
      console.error("Portfolio price fetch error for", ca, ":", error);
    }
  }

  return total;
}
  updateHomeBalance();
