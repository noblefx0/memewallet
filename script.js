

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
    list.innerHTML = "";

    if (Object.keys(portfolio).length === 0) {
        list.innerHTML =
            "<p style='text-align:center; color:#aaa;'>No tokens yet — search & buy some!</p>";
        return;
    }

    let totalValue = 0;

    for (const ca in portfolio) {
        const holding = portfolio[ca];
        if (holding.amount <= 0) continue;

        try {
            const response = await fetch(
                `https://api.dexscreener.com/latest/dex/tokens/${ca}`
            );
            const data = await response.json();

            if (!data.pairs || data.pairs.length === 0) continue;

            const pair = data.pairs[0];
            const price = Number(pair.priceUsd);
            const value = holding.amount * price;
            totalValue += value;

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
        <span>${holding.amount.toFixed(4)} coins</span>
      `;

            list.appendChild(card);
        } catch (error) {
            console.error("Price fetch error for", ca, ":", error);
        }
    }

    // Show total value
    const totalEl = document.createElement("p");
    totalEl.style.textAlign = "center";
    totalEl.style.fontWeight = "bold";
    totalEl.style.marginBottom = "16px";
    totalEl.innerHTML = `Total Value: $${totalValue.toFixed(2)}`;
    list.prepend(totalEl);
}

// Search button
document.getElementById("searchBtn").onclick = () => {
    const ca = document.getElementById("caInput").value.trim();
    if (!ca) return alert("Paste a CA");
    window.location.href = `buy-sell.html?coin=${ca}`;
};

// Load on page open + back
renderPortfolio();
window.addEventListener("pageshow", renderPortfolio);
