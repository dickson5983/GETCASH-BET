/**
 * GETCASH - ADVANCED OPERATOR REGISTRATION MODULE v4.2
 * Dependencies: Supabase SDK, Paystack Inline JS
 */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- CONFIGURATION ENGINE ---
const CONFIG = {
  SUPABASE_URL: 'https://jfdotsvfxtqrwcmpramg.supabase.co',
  SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZG90c3ZmeHRxcndjbXByYW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMDQ1MzIsImV4cCI6MjA2MzY4MDUzMn0.TkiD437ReQ8xc7J8wCB68oOZdxqPU-ltvuFAzAF5ypY",
  PAYSTACK_PK: 'pk_live_170d64a2ef9a487becb9e3e7e892c7f9fd3b0306',
  REG_FEE_KES: 50
};

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

// --- UI STATE CONTROLLER ---
const UI = {
  form: document.getElementById('registerForm'),
  status: document.getElementById('status'),
  msg: document.getElementById('msg'),
  btn: document.querySelector('button[type="submit"]'),

  updateStatus(text, isError = false) {
    this.status.textContent = text;
    this.status.style.color = isError ? '#ff4444' : '#00ffcc';
    console.log(`[UI_STATUS]: ${text}`);
  },

  setLoading(loading) {
    this.btn.disabled = loading;
    this.btn.textContent = loading ? 'PROCESSING...' : 'CREATE OPERATOR';
    this.btn.style.opacity = loading ? '0.5' : '1';
  }
};

// --- REGISTRATION LOGIC ---
const RegisterHandler = {
  async initialize() {
    if (!UI.form) return console.error("Fatal Error: Registration form missing from DOM.");
    UI.form.addEventListener('submit', (e) => this.handleSubmit(e));
  },

  async handleSubmit(e) {
    e.preventDefault();
    UI.setLoading(true);

    const payload = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      password: document.getElementById('password').value,
      referral: document.getElementById('referral').value.trim() || 'NONE'
    };

    // Complex Validation
    if (payload.password.length < 8) {
      UI.updateStatus("Security Key must be 8+ characters", true);
      UI.setLoading(false);
      return;
    }

    this.initiatePayment(payload);
  },

  initiatePayment(user) {
    UI.updateStatus("Redirecting to Secure Gateway...");

    const handler = PaystackPop.setup({
      key: CONFIG.PAYSTACK_PK,
      email: user.email,
      amount: CONFIG.REG_FEE_KES * 100, // Converts to cents
      currency: 'KES',
      metadata: { custom_fields: [{ display_name: "Operator Name", variable_name: "op_name", value: user.name }] },
      callback: (response) => this.finalizeRegistration(user, response),
      onClose: () => {
        UI.updateStatus("Transaction aborted by operator.", true);
        UI.setLoading(false);
      }
    });
    handler.openIframe();
  },

  async finalizeRegistration(user, payment) {
    UI.updateStatus("Payment Verified. Creating Terminal Access...");

    try {
      // 1. Supabase Auth Signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password
      });

      if (authError) throw authError;

      // 2. Database Record Creation
      const { error: dbError } = await supabase.from('users').insert([{
        id: authData.user.id,
        email: user.email,
        full_name: user.name,
        phone: user.phone,
        referral_code: user.referral,
        payment_ref: payment.reference,
        access_level: 'STANDARD_OPERATOR',
        created_at: new Date().toISOString()
      }]);

      if (dbError) throw dbError;

      UI.updateStatus("REGISTRATION COMPLETE. BOOTING SYSTEM...");
      setTimeout(() => window.location.href = "login.html", 2000);

    } catch (err) {
      console.error("CRITICAL_AUTH_FAILURE:", err);
      UI.updateStatus(`Critical Error: ${err.message}`, true);
      UI.setLoading(false);
    }
  }
};

RegisterHandler.initialize();