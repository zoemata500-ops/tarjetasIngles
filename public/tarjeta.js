const spanPalabra = document.getElementById('palabra');
const spanTraduccion = document.getElementById('traduccion');
const spanDefinicion = document.getElementById('definicion');
const mensaje = document.getElementById('mensaje');
const botonBocina = document.getElementById('bocina');
const listaEjemplos = document.getElementById('lista-ejemplos');
const editarPagina = document.getElementById('editar_pagina');

const id = new URLSearchParams(window.location.search).get('id');

let rondaActual = 0;
const vocesListas = esperarVoces();

function esperarVoces() {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const voces = window.speechSynthesis.getVoices();
    if (voces.length > 0) {
      resolve(voces);
      return;
    }

    const terminar = () => resolve(window.speechSynthesis.getVoices());
    window.speechSynthesis.addEventListener('voiceschanged', terminar, { once: true });
    setTimeout(terminar, 1500);
  });
}

function elegirVoz(voces) {
  const ingles = voces.filter((v) => v.lang.replace('_', '-').startsWith('en'));

  return (
    ingles.find((v) => v.localService && v.lang.replace('_', '-') === 'en-US') ||
    ingles.find((v) => v.localService) ||
    ingles[0] ||
    null
  );
}

function hablarUnaVez(texto, voz) {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    if (voz) {
      utterance.voice = voz;
    }
    utterance.onend = resolve;
    utterance.onerror = resolve;
    window.speechSynthesis.speak(utterance);
  });
}

async function hablar(texto, veces) {
  if (!('speechSynthesis' in window)) {
    mensaje.textContent = 'Tu navegador no soporta la voz';
    return;
  }

  rondaActual++;
  const miRonda = rondaActual;
  window.speechSynthesis.cancel();

  const voces = await vocesListas;
  const voz = elegirVoz(voces);

  for (let i = 0; i < veces; i++) {
    if (miRonda !== rondaActual) {
      return;
    }
    await hablarUnaVez(texto, voz);
  }
}

function mostrarEjemplos(ejemplos) {
  listaEjemplos.innerHTML = '';

  if (!Array.isArray(ejemplos) || ejemplos.length === 0) {
    const vacio = document.createElement('li');
    vacio.textContent = 'Esta tarjeta no tiene ejemplos';
    listaEjemplos.appendChild(vacio);
    return;
  }

  ejemplos.forEach((ejemplo) => {
    const li = document.createElement('li');

    const botonAudio = document.createElement('button');
    botonAudio.type = 'button';
    botonAudio.className = 'btn-audio btn-audio--ejemplo';
    botonAudio.setAttribute('aria-label', `Escuchar: ${ejemplo}`);
    botonAudio.addEventListener('click', () => {
      hablar(ejemplo, 1);
    });

    const textos = document.createElement('div');
    textos.className = 'ejemplo__textos';

    const spanIngles = document.createElement('span');
    spanIngles.textContent = ejemplo;

    textos.appendChild(spanIngles);
    li.appendChild(botonAudio);
    li.appendChild(textos);
    listaEjemplos.appendChild(li);
  });
}

async function mostrarTarjeta() {
  try {
    const respuesta = await fetch(`/tarjetas/${id}`);

    if (!respuesta.ok) {
      mensaje.textContent = 'Esa tarjeta no existe';
      return;
    }

    const tarjeta = await respuesta.json();
    spanPalabra.textContent = tarjeta.palabra || 'Sin palabra';
    spanTraduccion.textContent = tarjeta.traduccion || 'Sin traducción';
    spanDefinicion.textContent = tarjeta.definicion || 'Sin definición disponible';
    editarPagina.href = `/index.html?id=${id}`;
    mostrarEjemplos(tarjeta.ejemplos_adicionales);
  } catch (error) {
    mensaje.textContent = 'No se pudo conectar con el servidor';
  }
}

botonBocina.addEventListener('click', () => {
  const texto = spanTraduccion.textContent.trim();
  if (!texto) {
    return;
  }
  hablar(texto, 3);
});

mostrarTarjeta();