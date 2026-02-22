import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://jfdotsvfxtqrwcmpramg.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZG90c3ZmeHRxcndjbXByYW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMDQ1MzIsImV4cCI6MjA2MzY4MDUzMn0.TkiD437ReQ8xc7J8wCB68oOZdxqPU-ltvuFAzAF5ypY";
const supabase = createClient(supabaseUrl, supabaseKey);

const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPass').value;
        const msgEl = document.getElementById('loginMsg');

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            msgEl.innerText = "ACCESS DENIED: " + error.message;
        } else {
            sessionStorage.setItem("isLoggedIn", "true");
            window.location.href = "index.html";
        }
    });
}