// script.js

const coins = [
  { id: "shiba-inu", name: "Shiba Inu", symbol: "SHIB" },
  { id: "floki-inu", name: "FLOKI", symbol: "FLOKI" },
  { id: "popcat-sol", name: "Popcat", symbol: "POPCAT" },
  { id: "bonk", name: "Bonk", symbol: "BONK" },
  { id: "book-of-meme", name: "Book of Meme", symbol: "BOME" },
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH" },
  { id: "solana", name: "Solana", symbol: "SOL" }
];

// Function to fetch live prices from CoinGecko
async function fetchPrices() {
    try {
        const ids = coins.map(coin => coin.id).join(',');
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

        const response = await fetch(url);
        const data = await response.json();

        // Update the token list on the page
        renderTokens(data);
    } catch (error) {
        console.error("Error fetching prices:", error);
        document.getElementById("tokenList").innerHTML = "<p style='color: red; text-align: center;'>Failed to load prices. Try again later.</p>";
    }
}

// Render the token cards
function renderTokens(priceData) {
    const tokenList = document.getElementById("tokenList");
    tokenList.innerHTML = ""; // clear old cards

    coins.forEach(coin => {
        const info = priceData[coin.id];
        if (!info) return; // skip if no data

        const price = info.usd.toFixed(8);
        const change = info.usd_24h_change?.toFixed(2) || 0;
        const changeClass = change >= 0 ? "price-change-up" : "price-change-down";
        const changeText = change >= 0 ? `+${change}%` : ` ${change}%`;

        const card = document.createElement("div");
        card.className = "token-card";
        card.style.cursor = "pointer"; // makes it look clickable

        // Make the whole card clickable → opens buy-sell page for this coin
        card.onclick = () => {
            window.location.href = `buy-sell.html?coin=${coin.id}`;
        };

        card.innerHTML = `
      <div class="token-info">
        <div class="token-icon">${coin.symbol}</div>
        <div>
          <p> ${coin.name} ${coin.symbol}</p>
          <p class="price"> ${price}</p>
        </div>
      </div>
      <span class="${changeClass}"> ${changeText}</span>
    `;

        tokenList.appendChild(card);
    });
}

// Load prices when page opens
fetchPrices();

// Refresh prices every 60 seconds
setInterval(fetchPrices, 60000);