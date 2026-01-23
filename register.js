// Debug register.js (replace existing register.js with this to get detailed console logs)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

console.log('[register.js] module loaded');

const supabaseUrl = 'https://jfdotsvfxtqrwcmpramg.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZG90c3ZmeHRxcndjbXByYW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMDQ1MzIsImV4cCI6MjA2MzY4MDUzMn0.TkiD437ReQ8xc7J8wCB68oOZdxqPU-ltvuFAzAF5ypY";
const supabase = createClient(supabaseUrl, supabaseKey);

const paystackPublicKey = 'pk_live_170d64a2ef9a487becb9e3e7e892c7f9fd3b0306';

console.log('[register.js] supabase client created, paystack key set');

const form = document.getElementById('registerForm');
if (!form) {
  console.error('[register.js] registerForm not found in DOM');
  // show message on page for easier viewing
  const msg = document.getElementById('msg');
  if (msg) msg.innerText = 'Form not found on page (registerForm).';
} else {
  console.log('[register.js] registerForm found, attaching submit handler');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('[register.js] submit handler running');

    const name = document.getElementById('name')?.value?.trim();
    const email = document.getElementById('email')?.value?.trim();
    const phone = document.getElementById('phone')?.value?.trim();
    const password = document.getElementById('password')?.value?.trim();
    const referral = document.getElementById('referral')?.value || '';
    const statusEl = document.getElementById('status');
    const msgEl = document.getElementById('msg');

    console.log('[register.js] form values', { name, email, phone, password: !!password, referral });

    if (!name || !email || !phone || !password) {
      if (msgEl) msgEl.innerText = "Please fill all fields.";
      console.warn('[register.js] validation failed - missing field');
      return;
    }

    if (statusEl) statusEl.textContent = 'Processing payment...';

    if (typeof PaystackPop === 'undefined') {
      console.error('[register.js] PaystackPop is undefined - inline script did not load or is blocked');
      if (msgEl) msgEl.innerText = 'Payment library not loaded. Check network, CSP or extensions.';
      return;
    }

    console.log('[register.js] PaystackPop is available, creating handler');
    const handler = PaystackPop.setup({
      key: paystackPublicKey,
      email,
      amount: 8000, // 80 KES in smallest currency unit
      currency: 'KES',
      callback: async function (response) {
        console.log('[register.js] Paystack callback received', response);
        if (statusEl) statusEl.textContent = 'Registering...';

        try {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) {
            console.error('[register.js] Supabase signUp error', error);
            if (msgEl) msgEl.innerText = 'Registration failed: ' + error.message;
            return;
          }
          console.log('[register.js] Supabase signUp success', data);

          const insertResult = await supabase.from('users').insert([{ email, phone, referral, payment_ref: response.reference, full_name: name }]);
          if (insertResult.error) {
            console.error('[register.js] Supabase insert error', insertResult.error);
            if (msgEl) msgEl.innerText = 'Could not save user: ' + insertResult.error.message;
            return;
          }

          console.log('[register.js] user saved', insertResult.data);
          if (statusEl) statusEl.textContent = 'Registration successful! Redirecting...';
          // Optionally redirect:
          // window.location.href = '/dashboard.html';
        } catch (err) {
          console.error('[register.js] Unexpected error in callback', err);
          if (msgEl) msgEl.innerText = 'Unexpected error: ' + err.message;
        }
      },
      onClose: function () {
        console.log('[register.js] Paystack popup closed by user');
        if (statusEl) statusEl.textContent = 'Payment cancelled.';
      },
    });

    console.log('[register.js] handler created, calling openIframe() now');
    try {
      handler.openIframe();
      console.log('[register.js] openIframe() called successfully (check if popup appears or was blocked)');
    } catch (err) {
      console.error('[register.js] error calling openIframe()', err);
      if (msgEl) msgEl.innerText = 'Payment popup failed to open: ' + (err && err.message ? err.message : 'unknown error');
    }
  });
}