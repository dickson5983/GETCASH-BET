let derivWS;
let tickData = [];

function startAnalysis() {
    const market = document.getElementById('marketSelect').value;
    const status = document.getElementById('status');
    const signalDisplay = document.getElementById('signalResult');

    // Close old connection if it exists
    if (derivWS) derivWS.close();
    tickData = [];

    status.innerHTML = `Scanning ${market}...`;
    signalDisplay.innerHTML = "Gathering Data...";
    signalDisplay.style.color = "#888";

    // Connect to Deriv API
    derivWS = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');

    derivWS.onopen = () => {
        derivWS.send(JSON.stringify({ "ticks": market }));
    };

    derivWS.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.tick) {
            const price = data.tick.quote;
            const lastDigit = parseInt(price.toString().slice(-1));

            document.getElementById('latestTick').innerHTML = `Price: ${price} | Digit: <b style="color:#fff">${lastDigit}</b>`;

            tickData.push(lastDigit);
            if (tickData.length > 20) tickData.shift();

            if (tickData.length >= 15) {
                checkSignal(price);
            }
        }
    };
}

function checkSignal(currentPrice) {
    const signalDisplay = document.getElementById('signalResult');

    // Logic: If last 15 ticks show more than 55% "Over 5"
    const overFive = tickData.filter(d => d > 5).length;
    const probability = (overFive / tickData.length) * 100;

    if (probability >= 55) {
        signalDisplay.innerHTML = `🚀 ENTRY POINT FOUND!<br>Price: ${currentPrice}<br>ACTION: RUN TRADING BOT NOW`;
        signalDisplay.style.color = "#00ff00";
        signalDisplay.style.border = "2px solid #00ff00";
    } else {
        signalDisplay.innerHTML = "❌ TRY ANOTHER ANALYSIS";
        signalDisplay.style.color = "#ff4444";
        signalDisplay.style.border = "1px dashed #444";
    }
}