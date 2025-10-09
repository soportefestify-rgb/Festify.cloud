const SUPABASE_URL = 'https://hfbrykuqnakhjllcupik.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmYnJ5a3VxbmFraGpsbGN1cGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODAyNDksImV4cCI6MjA3NDU1NjI0OX0.wcSHmKqVNdAkEukf2hBk57lJvYSTygl8FIeUTlmJrJU';

// Carga el script de Supabase JS si no está presente

function debugLog(msg) {
  try {
    console.log('[RECOVER]', msg);
  } catch (_) {}
  var dbg = document.getElementById('debugLog');
  if (!dbg) {
    dbg = document.createElement('div');
    dbg.id = 'debugLog';
    dbg.style = 'margin:18px 0 0 0; color:#9cf; font-size:13px;';
    document.body.appendChild(dbg);
  }
  dbg.innerText += '\n' + msg;
}

document.addEventListener('DOMContentLoaded', function() {
  debugLog('DOM loaded');
  if (!window.supabase) {
    debugLog('Cargando Supabase JS...');
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js';
    s.onload = function() { debugLog('Supabase JS cargado'); handleRecover(); };
    s.onerror = function() { debugLog('Error cargando Supabase JS'); document.getElementById('status').textContent = 'Error cargando librería de Supabase.'; };
    document.head.appendChild(s);
  } else {
    debugLog('Supabase JS ya presente');
    handleRecover();
  }
});

function handleRecover() {
  debugLog('handleRecover() called');
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const type = params.get('type'); // puede ser 'recovery' o 'signup' o 'invite' o 'magiclink'
  debugLog('Parámetro code: ' + code);
  debugLog('Parámetro type: ' + type);
  if (!code) {
    document.getElementById('status').textContent = 'Falta el parámetro code en la URL.';
    debugLog('Falta parámetro code');
    return;
  }
  document.getElementById('status').textContent = 'Procesando enlace…';
  let supabase;
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    debugLog('Supabase client creado');
  } catch (e) {
    document.getElementById('status').textContent = 'Error creando cliente Supabase: ' + e;
    debugLog('Error creando cliente Supabase: ' + e);
    return;
  }
  supabase.auth.exchangeCodeForSession(code)
    .then(({ data, error }) => {
      debugLog('Respuesta exchangeCodeForSession: ' + JSON.stringify({data, error}));
      if (error) {
        document.getElementById('status').textContent = 'Error: ' + error.message;
        debugLog('Error de Supabase: ' + error.message);
        return;
      }
      // Si el link es de confirmación de email (signup/invite/magiclink), loguea y redirige
      if (type === 'signup' || type === 'invite' || type === 'magiclink') {
        document.getElementById('status').textContent = '¡Cuenta confirmada! Redirigiendo a la app...';
        debugLog('Cuenta confirmada, redirigiendo...');
        window.localStorage.setItem('sb-session', JSON.stringify(data.session));
        setTimeout(function() {
          window.location.href = 'https://festify.cloud/';
        }, 1200);
        return;
      }
      // Si es recuperación de contraseña, muestra el formulario
      document.getElementById('status').textContent = '¡Código válido! Ahora puedes establecer una nueva contraseña.';
      debugLog('Código válido, mostrando formulario');
      showPasswordForm(supabase, data.session);
    })
    .catch(function(e){
      document.getElementById('status').textContent = 'Error inesperado: ' + e;
      debugLog('Error inesperado: ' + e);
    });
}

function showPasswordForm(supabase, session) {
  const main = document.querySelector('main');
  main.innerHTML = `
    <h1>Establecer nueva contraseña</h1>
    <form id="pwForm">
      <input type="password" id="pw1" placeholder="Nueva contraseña" required minlength="8" style="padding:10px;font-size:16px;width:90%;margin-bottom:12px;border-radius:8px;border:1px solid #ccc"><br>
      <input type="password" id="pw2" placeholder="Repetir contraseña" required minlength="8" style="padding:10px;font-size:16px;width:90%;margin-bottom:12px;border-radius:8px;border:1px solid #ccc"><br>
      <button type="submit" style="padding:12px 28px;font-size:16px;border-radius:8px;background:#6F3DFA;color:#fff;font-weight:bold;border:none">Guardar contraseña</button>
    </form>
    <div id="pwStatus" style="margin-top:18px;color:#F55;font-weight:bold"></div>
  `;
  document.getElementById('pwForm').onsubmit = function(e) {
    e.preventDefault();
    const pw1 = document.getElementById('pw1').value;
    const pw2 = document.getElementById('pw2').value;
    if (pw1 !== pw2) {
      document.getElementById('pwStatus').textContent = 'Las contraseñas no coinciden.';
      return;
    }
    supabase.auth.updateUser({ password: pw1 })
      .then(async ({ error }) => {
        if (error) {
          document.getElementById('pwStatus').textContent = 'Error: ' + error.message;
        } else {
          document.getElementById('pwStatus').style.color = '#0A0';
          document.getElementById('pwStatus').textContent = '¡Contraseña cambiada! Redirigiendo a la app...';
          // Obtén la sesión actualizada y guárdala
          const { data } = await supabase.auth.getSession();
          window.localStorage.setItem('sb-session', JSON.stringify(data.session || session));
          setTimeout(function() {
            window.location.href = 'https://festify.cloud/';
          }, 1200);
        }
      });
};
}
