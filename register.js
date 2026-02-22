// register.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Use your new project credentials here
const SUPABASE_URL = 'https://odqewjsvlrvbacngwvdr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcWV3anN2bHJ2YmFjbmd3dmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTU4NTEsImV4cCI6MjA4NjY3MTg1MX0.JA13hYp3bULukTaSMuMZOJGyi8849eyqC8m4e5YXaGE';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

document.getElementById('registerForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const name = document.getElementById('name').value;

  const handler = PaystackPop.setup({
    key: 'pk_live_170d64a2ef9a487becb9e3e7e892c7f9fd3b0306',
    email: email,
    amount: 5000, // 50 KES
    currency: 'KES',

    // FIX: Define the function RIGHT HERE. 
    // This makes it a "Valid Function" that Paystack can see.
    callback: async function (response) {
      console.log("Success! Ref:", response.reference);

      // Now run your Supabase code here
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) return alert("Auth Error: " + error.message);

      await supabase.from('users').insert([{
        id: data.user.id,
        email: email,
        full_name: name,
        payment_ref: response.reference,
        is_admin: (email === 'dicksonmutinda06@gmail.com')
      }]);

      window.location.href = 'login.html';
    },
    onClose: function () {
      alert("Payment window closed.");
    }
  });

  handler.openIframe();
});