import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '/config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('recover-form');
const msg = document.getElementById('msg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  if (!email) return;
  msg.textContent = 'Enviando enlace...';
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/verify'
  });
  if (error) {
    msg.textContent = 'Error: ' + error.message;
  } else {
    msg.textContent = 'Si el correo existe, se ha enviado un enlace de recuperación. Revisa tu bandeja de entrada (y spam).';
  }
});
