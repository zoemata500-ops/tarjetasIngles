const botonBuscar = document.getElementById('buscar');
const campoPalabra = document.getElementById('palabra');
const spanDefinicion = document.getElementById('definicion');
const spanTraduccion = document.getElementById('traduccion');
const spanEjemplo = document.getElementById('ejemplo');
const mensaje = document.getElementById('mensaje');
const divResultadoGuardado = document.getElementById('resultado-guardado');
const inputUrlTarjetaResultado = document.getElementById('url-tarjeta');
const botonCopiar = document.getElementById('copiar');
const botonGuardar = document.getElementById('guardar');
let idActual = null;

botonBuscar.addEventListener('click', async () => {
  const palabra = campoPalabra.value.trim();
  if (!palabra) {
    return;
  }
  divResultadoGuardado.hidden = true;

  const respuesta = await fetch(`/buscar/${encodeURIComponent(palabra)}`);

  if (!respuesta.ok) {
    mensaje.textContent = "no se encontro la palabra"
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

  // --- INICIO código Devin: POST la primera vez, PUT las siguientes ---
  let metodo;
  let direccion;
  if (idActual === null) {
    metodo = 'POST';
    direccion = '/tarjetas';
  } else {
    metodo = 'PUT';
    direccion = `/tarjetas/${idActual}`;
  }

  const respuesta = await fetch(direccion, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tarjeta)
  });
  // --- FIN código Devin ---

  const datos = await respuesta.json();

  if (respuesta.ok) {
    mensaje.textContent = `Tarjeta guardada con el número ${datos.id}`;
    const url = `${window.location.origin}/tarjeta.html?id=${datos.id}`;
    inputUrlTarjetaResultado.value = url;
    divResultadoGuardado.hidden = false;
    // --- INICIO código Devin: recordar el id para que los siguientes guardados hagan PUT ---
    idActual = datos.id;
    // --- FIN código Devin ---
  

  } else {
    mensaje.textContent = {datos: "error"};
  }
    botonCopiar.addEventListener('click', async () => {
      await navigator.clipboard.writeText(inputUrlTarjetaResultado.value);
      console.log('copiando?')
    });


});