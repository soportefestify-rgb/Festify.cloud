import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Reemplaza estos valores por tus variables de entorno en Vercel:
// SUPABASE_URL y SUPABASE_ANON_KEY
const SUPABASE_URL = '<YOUR_SUPABASE_URL>';
const SUPABASE_ANON_KEY = '<YOUR_SUPABASE_ANON_KEY>';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('recover-form');
const msg = document.getElementById('msg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  if (!email) return;
  msg.textContent = 'Enviando enlace...';
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // redirectTo: si quieres que el enlace de recuperación vuelva a tu /verify:
    redirectTo: window.location.origin + '/verify'
  });
  if (error) {
    msg.textContent = 'Error: ' + error.message;
  } else {
    msg.textContent = 'Si el correo existe, se ha enviado un enlace de recuperación. Revisa tu bandeja de entrada (y spam).';
  }
});