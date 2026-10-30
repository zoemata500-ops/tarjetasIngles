const spanPalabra = document.getElementById('palabra');
const spanTraduccion = document.getElementById('traduccion');
const spanDefinicion = document.getElementById('definicion');
const mensaje = document.getElementById('mensaje');

const id = new URLSearchParams(window.location.search).get('id');

async function mostrarTarjeta() {
  const respuesta = await fetch(`/tarjetas/${id}`);

  if (!respuesta.ok) {
    mensaje.textContent = 'Esa tarjeta no existe';
    return;
  }

  const tarjeta = await respuesta.json();
  spanPalabra.textContent = tarjeta.palabra || 'Sin palabra';
  spanTraduccion.textContent = tarjeta.traduccion || 'Sin traducción';
  spanDefinicion.textContent = tarjeta.definicion || 'Sin definición disponible';
}

// --- INICIO código Devin ---
const botonBocina = document.getElementById('bocina');

function hablar(texto, veces) {
  // 1. Comprobar que el navegador soporta voz. Si no, avisar en 'mensaje' y return.
  if (!('speechSynthesis' in window)) {
    mensaje.textContent = 'Tu navegador no soporta la voz';
    return;
  }

  // 2. Detener cualquier lectura anterior.
  window.speechSynthesis.cancel();

  // 3. Repetir 'veces' veces: crear un utterance, configurarlo y pedirle al navegador que hable.
  for (let i = 0; i < veces; i++) {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
}

botonBocina.addEventListener('click', () => {
  hablar(spanTraduccion.textContent, 1);
});
// --- FIN código Devin ---

mostrarTarjeta();

