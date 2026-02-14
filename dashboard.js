// 1. CONFIGURATION (Updated with your key)
const SPORTMONKS_KEY = 'NCM4qMj2F0f4R1PT7W4xNpsnaPXrIHUCH4RrnXOC2AJtspO8OJXpUN6UkbZM';
const SUPABASE_URL = 'https://odqewjsvlrvbacngwvdr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xSAX11P58adkAc02kKHyIg_H28GboKA';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. UPDATED FETCH FUNCTION
async function fetchGames() {
    const display = document.getElementById('match-display');
    const today = new Date().toISOString().split('T')[0]; // Format: 2026-02-14

    // Using the 'fixtures/date' endpoint ensures the page isn't blank if no games are "live"
    const url = `https://api.sportmonks.com/v3/football/fixtures/date/${today}?api_token=${SPORTMONKS_KEY}&include=participants;odds`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            // This will help you see if it's a 401 (Wrong Key) or 403 (Plan issue)
            throw new Error(`API returned status ${response.status}`);
        }

        const result = await response.json();

        if (!result.data || result.data.length === 0) {
            display.innerHTML = "<p>No games found for today. Check your Sportmonks plan coverage.</p>";
            return;
        }

        renderGames(result.data); // Your function to show games on UI
    } catch (err) {
        console.error("Connection Error:", err);
        display.innerHTML = `<div style="color:red;"><b>Connection Error:</b> ${err.message}. <br>Make sure you are using a Local Server (Live Server).</div>`;
    }
}