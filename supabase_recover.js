// Configuración de Supabase
const SUPABASE_URL = 'https://hfbrykuqnakhjllcupik.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmYnJ5a3VxbmFraGpsbGN1cGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODAyNDksImV4cCI6MjA3NDU1NjI0OX0.wcSHmKqVNdAkEukf2hBk57lJvYSTygl8FIeUTlmJrJU';

function debugLog(msg) {
	try { console.log('[RECOVER]', msg); } catch (_) {}
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
	const type = params.get('type');
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
			// Si es recuperación de contraseña, redirige a la app con los tokens
			if (data.session && data.session.access_token && data.session.refresh_token) {
				const usp = new URLSearchParams();
				usp.set('access_token', data.session.access_token);
				usp.set('refresh_token', data.session.refresh_token);
				usp.set('type', 'recovery');
				const target = 'festify://auth-callback#' + usp.toString();
				debugLog('Redirigiendo a deep link: ' + target);
				window.location.replace(target);
				setTimeout(function() {
					document.getElementById('status').textContent = 'Si no se abre la app, pulsa el botón o copia el enlace.';
					// Mostrar botón y enlace manual
					let btn = document.getElementById('openBtn');
					if (!btn) {
						btn = document.createElement('a');
						btn.id = 'openBtn';
						btn.className = 'btn';
						btn.textContent = 'Abrir Festify';
						btn.style = 'display:inline-block;margin-top:18px;background:#6F3DFA;padding:12px 18px;border-radius:14px;color:#fff;text-decoration:none;font-weight:600;letter-spacing:.2px;cursor:pointer;';
						btn.onclick = function() { window.location.href = target; };
						document.querySelector('main').appendChild(btn);
					}
					let codeEl = document.getElementById('scheme');
					if (!codeEl) {
						codeEl = document.createElement('code');
						codeEl.id = 'scheme';
						codeEl.style = 'display:block;margin-top:10px;background:#241C3B;padding:6px 8px;border-radius:8px;font-size:13px;word-break:break-all;';
						document.querySelector('main').appendChild(codeEl);
					}
					codeEl.textContent = target;
				}, 1200);
				return;
			}
			document.getElementById('status').textContent = 'No se pudo obtener los tokens de sesión.';
			debugLog('No se pudo obtener access_token/refresh_token');
		})
		.catch(function(e){
			document.getElementById('status').textContent = 'Error inesperado: ' + e;
			debugLog('Error inesperado: ' + e);
		});
}
// ...existing code de tu supabase_recover.js...
