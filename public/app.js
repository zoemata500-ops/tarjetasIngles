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
const botonAgregarEjemplo = document.getElementById('agregar-ejemplo');
const listaEjemplosAdicionales = document.getElementById('lista-ejemplos-adicionales');

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
    ejemplos: obtenerEjemplosAdicionales()
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

function crearEjemploAdicional(texto = '') {
  const li = document.createElement('li');
  li.className = 'item-ejemplo';

  const campos = document.createElement('div');
  campos.className = 'item-ejemplo__campos';

  const ingles = document.createElement('textarea');
  ingles.className = 'ejemplo-ingles';
  ingles.placeholder = 'Escribe tu ejemplo en inglés...';
  ingles.rows = 2;
  ingles.value = texto;

  const espanol = document.createElement('textarea');
  espanol.className = 'ejemplo-espanol';
  espanol.placeholder = 'Escribe la traducción (opcional)...';
  espanol.rows = 2;

  const botonEliminar = document.createElement('button');
  botonEliminar.className = 'btn-eliminar-ejemplo';
  botonEliminar.type = 'button';
  botonEliminar.setAttribute('aria-label', 'Eliminar este ejemplo');
  botonEliminar.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;

  botonEliminar.addEventListener('click', () => {
    li.remove();
  });

  campos.appendChild(ingles);
  campos.appendChild(espanol);
  li.appendChild(campos);
  li.appendChild(botonEliminar);
  listaEjemplosAdicionales.appendChild(li);

  if (!texto) {
    ingles.focus();
  }
}

function obtenerEjemplosAdicionales() {
  const camposIngles = listaEjemplosAdicionales.querySelectorAll('.ejemplo-ingles');
  const ejemplos = [];

  camposIngles.forEach((campo) => {
    const texto = campo.value.trim();
    if (texto) {
      ejemplos.push(texto);
    }
  });

  return ejemplos;
}

botonAgregarEjemplo.addEventListener('click', () => {
  crearEjemploAdicional();
});

async function llenarInformacionTarjeta() {
  const parametros = new URLSearchParams(window.location.search);
  const id = parametros.get('id');

  if (!id) {
    return;
  }

  try {
    const respuesta = await fetch(`/tarjetas/${encodeURIComponent(id)}`);

    if (!respuesta.ok) {
      mensaje.textContent = 'Esa tarjeta no existe';
      return;
    }

    const tarjeta = await respuesta.json();

    campoPalabra.value = tarjeta.palabra || '';
    spanTraduccion.textContent = tarjeta.traduccion || '';
    spanDefinicion.textContent = tarjeta.definicion || SIN_DEFINICION;

    listaEjemplosAdicionales.innerHTML = '';
    if (Array.isArray(tarjeta.ejemplos_adicionales)) {
      tarjeta.ejemplos_adicionales.forEach((ejemplo) => {
        crearEjemploAdicional(ejemplo);
      });
    }

    idActual = tarjeta.id;
    mensaje.textContent = `Editando la tarjeta ${tarjeta.id}`;
  } catch (error) {
    mensaje.textContent = 'No se pudo conectar con el servidor';
  }
}

llenarInformacionTarjeta();