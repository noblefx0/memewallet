

// Save portfolio + balance
function savePortfolio() {
  localStorage.setItem("portfolio", JSON.stringify(portfolio));
}

function updateBalance() {
  const el = document.querySelector(".balance");
  if (el) {
    el.innerHTML = `$${balance.toFixed(2)}`;
  }
}

// Render only owned coins on home

async function renderPortfolio() {
  const list = document.getElementById("tokenList");
  const loading = document.getElementById("loadingState");

  if (Object.keys(portfolio).length === 0) {
    list.innerHTML = "<p style='text-align:center; color:#aaa;'>No tokens yet — go buy some!</p>";
    if (loading) loading.style.display = "none";
    return;
  }

  const ownedCAs = Object.keys(portfolio);

  try {
    let totalValue = 0;
    const holdingsArray = [];

    // First collect all data
    for (const ca of ownedCAs) {
      const holding = portfolio[ca];
      if (holding.amount < 0.0001) continue;

      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${ca}`);
      const data = await response.json();

      if (!data.pairs || data.pairs.length === 0) continue;

      const pair = data.pairs[0];
      const currentPrice = Number(pair.priceUsd);
      const value = holding.amount * currentPrice;
      totalValue += value;

      holdingsArray.push({
        ca,
        holding,
        pair,
        value,
        currentPrice
      });
    }

    // Sort by value descending (highest first)
    holdingsArray.sort((a, b) => b.value - a.value);

    // Now render in sorted order
    holdingsArray.forEach(({ ca, holding, pair, value, currentPrice }) => {
      const pnlPercent = holding.totalCost > 0
        ? ((value - holding.totalCost) / holding.totalCost) * 100
        : 0;
      const pnlColor = pnlPercent >= 0 ? '#00ff9d' : '#ff3b30';
      const pnlText = pnlPercent >= 0 ? `+${pnlPercent.toFixed(2)}%` : `${pnlPercent.toFixed(2)}%`;

      const card = document.createElement("div");
      card.className = "token-card";
      card.onclick = () => {
        window.location.href = `buy-sell.html?coin=${ca}`;
      };

      card.innerHTML = `
        <div class="token-info">
          <div class="token-icon">${pair.baseToken.symbol}</div>
          <div>
            <p>${pair.baseToken.name} (${pair.baseToken.symbol})</p>
            <p class="price">$${value.toFixed(2)}</p>
          </div>
        </div>
        <div style="text-align:right;">
          <p>${formatNumber(holding.amount)} coins</p>
          <p style="color:${pnlColor};">${pnlText}</p>
        </div>
      `;

      list.appendChild(card);
    });

    // Total value at top
    const totalEl = document.createElement("p");
    totalEl.style.textAlign = "center";
    totalEl.style.fontWeight = "bold";
    totalEl.style.marginBottom = "16px";
    totalEl.innerHTML = `Total Value: $${totalValue.toFixed(2)}`;
    list.prepend(totalEl);

    
    if (loading) loading.remove();
  } catch (error) {
    console.error("DexScreener fetch error:", error);
    list.innerHTML = "<p style='text-align:center; color:red;'>Failed to load prices</p>";
  }
}

// Load + refresh
renderPortfolio();

// Search button - simple & reliable
document.getElementById("searchBtn").onclick = () => {
  const input = document.getElementById("caInput");
  if (!input) {
    console.error("caInput not found in HTML");
    alert("Search input missing - check HTML IDs");
    return;
  }

  const ca = input.value.trim();
  if (!ca) {
    alert("Paste a contract address first!");
    return;
  }

  console.log("Search clicked! CA:", ca);
  window.location.href = `buy-sell.html?coin=${ca}`;
};

// Optional: press Enter in input to search
document.getElementById("caInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.getElementById("searchBtn").click();
  }
});

function formatNumber(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K';
  } else {
    return num.toFixed(4);  // keep 4 decimals for small numbers
  }
}
updateHomeBalance(); // initial
