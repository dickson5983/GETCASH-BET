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

    const name = document.getElementById('name')?.value?.trim();
    const email = document.getElementById('email')?.value?.trim();
    const phone = document.getElementById('phone')?.value?.trim();
    const password = document.getElementById('password')?.value?.trim();
    const referral = document.getElementById('referral')?.value || '';

    if (!name || !email || !phone || !password) {
      if (msgEl) msgEl.innerText = "Please fill all fields.";
      return;
    }

    if (statusEl) statusEl.textContent = 'Initializing Secure Payment...';

    const handler = PaystackPop.setup({
      key: paystackPublicKey,
      email: email,
      amount: 5000, // Updated: 50.00 KES (50 * 100)
      currency: 'KES',
      callback: async function (response) {
        if (statusEl) statusEl.textContent = 'Payment successful! Creating account...';

        try {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;

          await supabase.from('users').insert([{
            email,
            phone,
            referral,
            payment_ref: response.reference,
            full_name: name
          }]);

          if (statusEl) statusEl.textContent = 'Registration Complete! Redirecting...';
          setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        } catch (err) {
          if (msgEl) msgEl.innerText = 'Error: ' + err.message;
        }
      },
      onClose: () => { if (statusEl) statusEl.textContent = 'Payment cancelled.'; }
    });
    handler.openIframe();
  });
}