import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- CONFIGURATION ---
const SUPABASE_URL = 'https://jfdotsvfxtqrwcmpramg.supabase.co';
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZG90c3ZmeHRxcndjbXByYW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMDQ1MzIsImV4cCI6MjA2MzY4MDUzMn0.TkiD437ReQ8xc7J8wCB68oOZdxqPU-ltvuFAzAF5ypY";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const loginForm = document.getElementById('loginForm');
const msgEl = document.getElementById('loginMsg');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPass').value;

        msgEl.style.color = "#00ffcc";
        msgEl.innerText = "AUTHENTICATING...";

        try {
            // Attempt Supabase SignIn
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                throw error;
            }

            // Success: Set a session flag and redirect
            msgEl.innerText = "ACCESS GRANTED. REDIRECTING...";
            sessionStorage.setItem("isLoggedIn", "true");

            // Wait 1 second for effect then go to index (which now has dashboard access)
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);

        } catch (err) {
            console.error("Login Failed:", err.message);
            msgEl.style.color = "#ff4444";
            msgEl.innerText = "ACCESS DENIED: " + err.message;
        }
    });
}