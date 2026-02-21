/**
 * GETCASH SUPERFAST SIGNAL ENGINE v4.0
 * ARCHITECTURE: ASYNCHRONOUS DATA PIPELINE
 * THRESHOLD: 80% WIN PROBABILITY
 */

(function () {
    // STATE MANAGEMENT
    const state = {
        socket: null,
        ticks: [],
        currentMarket: '',
        targetDigit: 5,
        targetRate: 80.0,
        isScanning: false,
        stats: {
            totalProcessed: 0,
            peakRate: 0,
            startTime: null,
            velocity: 0
        },
        ui: {
            btn: null,
            price: null,
            digits: null,
            status: null,
            signal: null,
            progress: null
        }
    };

    // PERFORMANCE: CACHE DOM SELECTORS
    const initializeUI = () => {
        state.ui.btn = document.getElementById('startBtn');
        state.ui.price = document.getElementById('priceDisplay');
        state.ui.digits = document.getElementById('digitHistory');
        state.ui.status = document.getElementById('status');
        state.ui.signal = document.getElementById('signalResult');
        state.ui.progress = document.getElementById('progress');
    };

    // CORE ENGINE: INITIALIZATION
    window.initScanner = function () {
        if (!state.ui.btn) initializeUI();

        const market = document.getElementById('marketSelect').value;
        const type = document.getElementById('contractType')?.value || 'over';
        const pred = parseInt(document.getElementById('prediction')?.value || 5);

        // RESET ENGINE STATE
        state.currentMarket = market;
        state.targetDigit = pred;
        state.ticks = [];
        state.isScanning = true;
        state.stats.startTime = Date.now();
        state.stats.totalProcessed = 0;

        // UI FEEDBACK
        state.ui.btn.innerText = "RUNNING HIGH-SPEED SCAN...";
        state.ui.btn.style.boxShadow = "0 0 15px #0f0";

        // RE-ESTABLISH WEBSOCKET
        if (state.socket) state.socket.close();

        state.socket = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');

        state.socket.onopen = () => {
            console.log(`%c[ENGINE] Stream Started: ${market}`, "color: #00ff00; font-weight: bold;");
            state.socket.send(JSON.stringify({ "ticks": market }));
        };

        state.socket.onmessage = (event) => {
            const response = JSON.parse(event.data);
            if (response.tick) {
                // BYPASS UI THREAD FOR LOGIC
                processTickData(response.tick);
            }
        };

        state.socket.onerror = (err) => {
            state.ui.status.innerText = "CONNECTION ERROR - RESTARTING...";
            setTimeout(initScanner, 2000);
        };
    };

    // DATA PROCESSING PIPELINE
    const processTickData = (tick) => {
        const quote = tick.quote;
        const lastDigit = parseInt(quote.toString().slice(-1));

        // PUSH DATA TO BUFFER
        state.ticks.push(lastDigit);
        state.stats.totalProcessed++;

        // CIRCULAR BUFFER OPTIMIZATION (Keep last 40 for stability)
        if (state.ticks.length > 40) state.ticks.shift();

        // RUN ANALYTICS
        const analysis = performAdvancedMath();

        // BATCHED UI UPDATES
        requestAnimationFrame(() => {
            updateInterface(quote, lastDigit, analysis);
        });
    };

    // ADVANCED MATH MODULE
    const performAdvancedMath = () => {
        if (state.ticks.length < 15) return { ready: false, prob: 0 };

        const type = document.getElementById('contractType')?.value || 'over';
        let wins = 0;

        // FAST FILTERING
        for (let i = 0; i < state.ticks.length; i++) {
            if (type === 'over') {
                if (state.ticks[i] > state.targetDigit) wins++;
            } else {
                if (state.ticks[i] < state.targetDigit) wins++;
            }
        }

        const currentProb = (wins / state.ticks.length) * 100;
        if (currentProb > state.stats.peakRate) state.stats.peakRate = currentProb;

        return {
            ready: state.ticks.length >= 20,
            prob: currentProb,
            velocity: calculateTrendVelocity()
        };
    };

    const calculateTrendVelocity = () => {
        if (state.ticks.length < 10) return 0;
        const recent = state.ticks.slice(-5).filter(d => d > state.targetDigit).length;
        const older = state.ticks.slice(-10, -5).filter(d => d > state.targetDigit).length;
        return recent - older;
    };

    // UI RENDERER (Optimized for 60FPS)
    const updateInterface = (price, digit, analysis) => {
        // Update Price & Last Digit
        state.ui.price.innerHTML = `
            <span style="font-size: 0.9rem; color: #888;">PRICE:</span> ${price} 
            <span style="color: #0f0; border: 1px solid #0f0; padding: 2px 5px;">${digit}</span>
        `;

        // Update Digit Strip
        let digitHtml = '';
        for (let i = 0; i < state.ticks.length; i++) {
            const isMatch = (state.ticks[i] > state.targetDigit);
            digitHtml += `<span class="digit" style="color: ${isMatch ? '#0f0' : '#f44'}">${state.ticks[i]}</span>`;
        }
        state.ui.digits.innerHTML = digitHtml;

        // Handle Signal Output
        if (!analysis.ready) {
            state.ui.signal.innerHTML = `<span style="color: #555;">BUFFERING DATA STREAM... [${state.ticks.length}/20]</span>`;
            return;
        }

        if (analysis.prob >= state.targetRate) {
            state.ui.signal.className = 'signal-active';
            state.ui.signal.innerHTML = `
                <div style="background: rgba(0,255,0,0.2); border: 2px solid #0f0; padding: 15px;">
                    <h2 style="margin: 0; color: #fff;">🚀 HIGH CONFIDENCE: ${analysis.prob.toFixed(1)}%</h2>
                    <p style="margin: 5px 0;">ENTRY SIGNAL DETECTED - EXECUTE BOT</p>
                    <small>Peak Probability: ${state.stats.peakRate.toFixed(1)}%</small>
                </div>
            `;
            // Optional: Add Audio Alert Trigger Here
        } else {
            state.ui.signal.className = '';
            state.ui.signal.innerHTML = `
                <div style="border: 1px dashed #333; padding: 15px; color: #444;">
                    SCANNING FOR 80% TARGET... (CURRENT: ${analysis.prob.toFixed(1)}%)
                </div>
            `;
        }

        // Update Stats Dashboard
        const duration = ((Date.now() - state.stats.startTime) / 1000).toFixed(0);
        state.ui.status.innerHTML = `
            MARKET: ${state.currentMarket} | UP-TIME: ${duration}s | TICKS: ${state.stats.totalProcessed}
        `;
    };

    console.log("%cGETCASH SUPERFAST ENGINE LOADED", "color: #00ff00; font-weight: bold; background: #000; padding: 5px;");
})();