import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://odqewjsvlrvbacngwvdr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcWV3anN2bHJ2YmFjbmd3dmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTU4NTEsImV4cCI6MjA4NjY3MTg1MX0.JA13hYp3bULukTaSMuMZOJGyi8849eyqC8m4e5YXaGE';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const msg = document.getElementById('loginMsg');
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPass').value;

    msg.innerText = "AUTHORIZING ADMIN ACCESS...";

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Check if the logged-in email matches your admin email
        if (email === "dicksonmutinda06@gmail.com") {
            sessionStorage.setItem("userRole", "admin");
            msg.style.color = "#00ffcc";
            msg.innerText = "WELCOME ADMIN. ACCESSING CORE TERMINAL...";
        } else {
            sessionStorage.setItem("userRole", "operator");
            msg.innerText = "ACCESS GRANTED. BOOTING OPERATOR TOOLS...";
        }

        sessionStorage.setItem("isLoggedIn", "true");
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);

    } catch (err) {
        msg.style.color = "#ff4444";
        msg.innerText = "DENIED: " + err.message;
    }
});