import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://jfdotsvfxtqrwcmpramg.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZG90c3ZmeHRxcndjbXByYW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMDQ1MzIsImV4cCI6MjA2MzY4MDUzMn0.TkiD437ReQ8xc7J8wCB68oOZdxqPU-ltvuFAzAF5ypY";
const supabase = createClient(supabaseUrl, supabaseKey);

const paystackPublicKey = 'pk_live_170d64a2ef9a487becb9e3e7e892c7f9fd3b0306';

const form = document.getElementById('registerForm');
const statusEl = document.getElementById('status');
const msgEl = document.getElementById('msg');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const referral = document.getElementById('referral').value;

    statusEl.textContent = 'Initializing Payment...';

    const handler = PaystackPop.setup({
      key: paystackPublicKey,
      email: email,
      amount: 5000, // 50 KES
      currency: 'KES',
      callback: async function (response) {
        statusEl.textContent = 'Payment successful! Finalizing registration...';

        const { data, error } = await supabase.auth.signUp({ email, password });

        if (!error) {
          await supabase.from('users').insert([
            { email, phone, referral, full_name: name, payment_ref: response.reference }
          ]);
          window.location.href = "login.html";
        } else {
          msgEl.innerText = "Error: " + error.message;
        }
      },
      onClose: () => { statusEl.textContent = 'Payment cancelled.'; }
    });
    handler.openIframe();
  });
}