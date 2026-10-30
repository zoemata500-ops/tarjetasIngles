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

mostrarTarjeta();

