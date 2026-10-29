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



document.querySelectorAll('.btn-editar').forEach((btn) => {
  btn.addEventListener('click', () => {
    const elemento = document.getElementById(btn.dataset.objetivo);

    if (elemento.isContentEditable) {
      elemento.contentEditable = 'false';
      btn.textContent = 'Editar';
    } else {
      elemento.contentEditable = 'true';
      elemento.focus();
      btn.textContent = 'Listo';
    }
  });
});
const botonGuardar = document.getElementById('guardar');
const mensaje = document.getElementById('mensaje');

botonGuardar.addEventListener('click', async () => {
  const palabra = campoPalabra.value.trim();

  if (!palabra) {
    mensaje.textContent = 'Escribe una palabra y búscala antes de guardar';
    return;
  }

  const tarjeta = {
    palabra: palabra,
    traduccion: spanTraduccion.textContent.trim(),
    definicion: spanDefinicion.textContent.trim(),
    
  };

  const respuesta = await fetch('/tarjetas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tarjeta)
    
  });

  const datos = await respuesta.json();

  if (respuesta.ok) {
    mensaje.textContent = `Tarjeta guardada con el número ${datos.id}`;
  } else {
    mensaje.textContent = datos.error;
  }
});