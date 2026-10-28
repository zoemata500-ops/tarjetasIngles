const botonBuscar = document.getElementById('buscar');
const campoPalabra = document.getElementById('palabra');
const spanDefinicion = document.getElementById('definicion');
const spanTraduccion = document.getElementById('traduccion');
const spanEjemplo = document.getElementById('ejemplo');
const spanMensaje = document.getElementById('mensaje');

botonBuscar.addEventListener('click', async () => {
  const palabra = campoPalabra.value.trim();
  if (!palabra) {
    return;
  }

  const respuesta = await fetch(`/buscar/${encodeURIComponent(palabra)}`);

  if (!respuesta.ok) {
    spanMensaje.textContent = "no se encontro la palabra"
    spanDefinicion.textContent = '';
    spanTraduccion.textContent = '';
    return;
  }

  const datos = await respuesta.json();
  console.log(datos)
  spanDefinicion.textContent = datos.definicion || "sin definicion disponible";
  spanTraduccion.textContent = datos.traduccion; 
});
