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
const enlaceAbrir = document.getElementById('abrir-tarjeta');

const SIN_DEFINICION = 'Sin definición disponible';
let idActual = null;

function limpiar(texto) {
  const limpio = texto.trim();
  return limpio === SIN_DEFINICION ? '' : limpio;
}

function obtenerClave() {
  let clave = localStorage.getItem('clave');

  if (!clave) {
    clave = prompt('Clave de edición');
    if (clave) {
      localStorage.setItem('clave', clave);
    }
  }

  return clave;
}

botonBuscar.addEventListener('click', async () => {
  const palabra = campoPalabra.value.trim();
  if (!palabra) {
    mensaje.textContent = 'Escribe una palabra para buscar';
    return;
  }

  idActual = null;
  divResultadoGuardado.hidden = true;
  mensaje.textContent = '';
  spanDefinicion.textContent = '';
  spanTraduccion.textContent = '';
  if (spanEjemplo) {
    spanEjemplo.textContent = '';
  }

  try {
    const respuesta = await fetch(`/buscar/${encodeURIComponent(palabra)}`);
    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mensaje.textContent = datos.error || 'No se encontró la palabra';
      return;
    }

    spanTraduccion.textContent = datos.traduccion;
    spanDefinicion.textContent = datos.definicion || SIN_DEFINICION;
  } catch (error) {
    mensaje.textContent = 'No se pudo conectar con el servidor';
  }
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

  const clave = obtenerClave();
  if (!clave) {
    mensaje.textContent = 'Necesitas la clave para guardar';
    return;
  }

  const tarjeta = {
    palabra: palabra,
    traduccion: limpiar(spanTraduccion.textContent),
    definicion: limpiar(spanDefinicion.textContent),
    ejemplo: spanEjemplo ? limpiar(spanEjemplo.textContent) : ''
  };

  let metodo;
  let direccion;
  if (idActual === null) {
    metodo = 'POST';
    direccion = '/tarjetas';
  } else {
    metodo = 'PUT';
    direccion = `/tarjetas/${idActual}`;
  }

  botonGuardar.disabled = true;

  try {
    const respuesta = await fetch(direccion, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', 'x-clave': clave },
      body: JSON.stringify(tarjeta)
    });

    if (respuesta.status === 401) {
      localStorage.removeItem('clave');
      mensaje.textContent = 'Clave incorrecta. Vuelve a intentarlo';
      return;
    }

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mensaje.textContent = datos.error || 'No se pudo guardar';
      return;
    }

    idActual = datos.id;
    mensaje.textContent = `Tarjeta guardada con el número ${datos.id}`;
    inputUrlTarjetaResultado.value = `${window.location.origin}/tarjeta.html?id=${datos.id}`;
    enlaceAbrir.href = inputUrlTarjetaResultado.value;
    divResultadoGuardado.hidden = false;
  } catch (error) {
    mensaje.textContent = 'No se pudo conectar con el servidor';
  } finally {
    botonGuardar.disabled = false;
  }
});

botonCopiar.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(inputUrlTarjetaResultado.value);
    mensaje.textContent = 'URL copiada';
  } catch (error) {
    inputUrlTarjetaResultado.select();
    mensaje.textContent = 'Copia la URL con Ctrl+C';
  }
});