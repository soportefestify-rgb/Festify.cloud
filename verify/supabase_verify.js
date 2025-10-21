import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Reemplaza con tus variables de entorno en Vercel:
// SUPABASE_URL y SUPABASE_ANON_KEY
const SUPABASE_URL = '<YOUR_SUPABASE_URL>';
const SUPABASE_ANON_KEY = '<YOUR_SUPABASE_ANON_KEY>';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const status = document.getElementById('status');

function parseHash(hash) {
  const params = {};
  hash.replace(/^#/, '').split('&').forEach(kv => {
    const [k, v] = kv.split('=');
    if (k) params[k] = decodeURIComponent(v);
  });
  return params;
}

(async function () {
  // Cuando Supabase redirige tras el enlace de recuperación/restablecimiento,
  // a menudo deja tokens en la parte hash de la URL (access_token, refresh_token).
  const hashParams = parseHash(window.location.hash || '');
  if (hashParams.access_token && hashParams.refresh_token) {
    status.textContent = 'Estableciendo sesión...';
    const { error } = await supabase.auth.setSession({
      access_token: hashParams.access_token,
      refresh_token: hashParams.refresh_token
    });
    if (error) {
      status.textContent = 'Error al establecer sesión: ' + error.message;
    } else {
      status.textContent = 'Sesión iniciada correctamente. Te redirigimos...';
      setTimeout(() => window.location.href = '/', 1500);
    }
    return;
  }

  status.textContent = 'Revisa tu correo y sigue el enlace recibido para completar el restablecimiento. Si ya seguiste el enlace, la página lo procesará automáticamente.';
})();