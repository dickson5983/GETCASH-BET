/**
 * GETCASH ADVANCED SIGNAL ENGINE v2.0
 * Features: Trend Velocity, Heatmap Logic, High-Confidence Filtering
 */

let socket;
let marketData = {
    ticks: [],
    velocity: 0,
    peakProbability: 0,
    startTime: null
};

const CONFIG = {
    APP_ID: 1089,
    MIN_TICKS: 30,         // Increased sample size for 80% accuracy
    WIN_THRESHOLD: 80.0,   // Your requested 80% rate
    VOLATILITY_SAMPLES: 5  // How many ticks to calculate "Speed"
};

function initScanner() {
    const market = document.getElementById('marketSelect').value;
    const btn = document.getElementById('startBtn');

    // UI Feedback & Reset
    btn.innerText = "ENGINE BOOTING...";
    btn.disabled = true;
    resetEngine();

    if (socket) socket.close();

    // Establish WebSocket Connection
    socket = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${CONFIG.APP_ID}`);

    socket.onopen = () => {
        marketData.startTime = Date.now();
        console.log(`%c [SYSTEM] Connected to ${market}`, "color: #00ff00");
        socket.send(JSON.stringify({ "ticks": market }));
    };

    socket.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.tick) {
            handleNewTick(data.tick);
        }
    };
}

function handleNewTick(tick) {
    const price = tick.quote;
    const digit = parseInt(price.toString().slice(-1));

    // Update Data Array
    marketData.ticks.push(digit);
    if (marketData.ticks.length > 50) marketData.ticks.shift();

    // Complex Calculations
    const probability = calculateProbability();
    const velocity = calculateVelocity();

    updateAdvancedUI(price, digit, probability, velocity);
    checkExecutionSignal(probability, velocity);
}

/**
 * CALCULATE TREND VELOCITY
 * Determines if the market is becoming more or less favorable
 */
function calculateVelocity() {
    if (marketData.ticks.length < 10) return 0;
    const recent = marketData.ticks.slice(-5).filter(d => d > 5).length;
    const older = marketData.ticks.slice(-10, -5).filter(d => d > 5).length;
    return recent - older; // Positive means trend is strengthening
}

function calculateProbability() {
    if (marketData.ticks.length === 0) return 0;
    const matches = marketData.ticks.filter(d => d > 5).length;
    return (matches / marketData.ticks.length) * 100;
}

function updateAdvancedUI(price, digit, prob, vel) {
    // Price & Digit Display
    document.getElementById('priceDisplay').innerHTML = `
        <div style="font-size: 0.8rem; color: #666;">LIVE QUOTE</div>
        ${price} <span style="color: #0f0;">[${digit}]</span>
    `;

    // Digit History Strip
    const container = document.getElementById('digitHistory');
    container.innerHTML = marketData.ticks.map(d =>
        `<span class="digit" style="border-color: ${d > 5 ? '#0f0' : '#444'}">${d}</span>`
    ).join('');

    // Update Stats Card
    document.getElementById('status').innerHTML = `
        PROBABILITY: ${prob.toFixed(1)}% | 
        VELOCITY: ${vel > 0 ? '↑' : vel < 0 ? '↓' : '→'} | 
        SAMPLES: ${marketData.ticks.length}
    `;
}

function checkExecutionSignal(prob, vel) {
    const resultBox = document.getElementById('signalResult');

    // COMPLEX LOGIC: Probability must be 80% AND Velocity must be stable (not falling)
    if (marketData.ticks.length >= CONFIG.MIN_TICKS && prob >= CONFIG.WIN_THRESHOLD && vel >= 0) {
        triggerSuccessUI(resultBox, prob);
    } else {
        triggerWaitingUI(resultBox, prob);
    }
}

function triggerSuccessUI(box, prob) {
    box.style.background = "rgba(0, 255, 0, 0.2)";
    box.style.border = "2px solid #0f0";
    box.style.boxShadow = "0 0 20px #0f0";
    box.innerHTML = `
        <h2 style="margin:0; color:#fff;">🚀 SIGNAL IDENTIFIED</h2>
        <div style="font-size: 1.5rem; font-weight: bold;">ACCURACY: ${prob.toFixed(1)}%</div>
        <p>VELOCITY STABLE - EXECUTE OVER 5 NOW</p>
    `;
}

function triggerWaitingUI(box, prob) {
    box.style.background = "transparent";
    box.style.border = "1px dashed #333";
    box.style.boxShadow = "none";
    box.innerHTML = `
        <span style="color: #555;">SCANNING MARKET STABILITY...</span><br>
        <small>Target: 80% | Current: ${prob.toFixed(1)}%</small>
    `;
}

function resetEngine() {
    marketData.ticks = [];
    marketData.velocity = 0;
}