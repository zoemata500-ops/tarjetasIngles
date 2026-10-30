const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const ARCHIVO = path.join(__dirname, 'tarjetas.json');

app.use(express.json());
app.use(express.static('public'));

function cargarDatos() {
  if (!fs.existsSync(ARCHIVO)) {
    return { siguienteId: 1, tarjetas: [] };
  }
  const contenido = fs.readFileSync(ARCHIVO, 'utf8');
  return JSON.parse(contenido);
}

const datosGuardados = cargarDatos();
const tarjetas = datosGuardados.tarjetas;
let siguienteId = datosGuardados.siguienteId;

function guardarDatos() {
  const datos = { siguienteId: siguienteId, tarjetas: tarjetas };
  const texto = JSON.stringify(datos, null, 2);
  fs.writeFileSync(ARCHIVO, texto);
}

async function definir(palabra) {
  const respuesta = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${palabra}`);
  if (respuesta.ok) {
    const datosB = await respuesta.json();
    return datosB[0].meanings[0].definitions[0].definition;
  }
  return null;
}

async function traducir(texto, origen, destino) {
  const respuesta = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=${origen}|${destino}`
  );
  if (respuesta.ok) {
    const datos = await respuesta.json();
    if (datos.quotaFinished || Number(datos.responseStatus) !== 200) {
      return null;
    }
    return datos.responseData.translatedText;
  }
  return null;
}

app.post('/tarjetas', (req, res) => {
  const { palabra, traduccion, definicion, ejemplo } = req.body || {};
  if (!palabra || !traduccion) {
    return res.status(400).json({ error: 'La palabra y la traducción son obligatorias' });
  }
  const tarjeta = {
    id: siguienteId,
    palabra: palabra,
    traduccion: traduccion,
    definicion: definicion || '',
    ejemplo: ejemplo || ''
  };
  siguienteId++;
  tarjetas.push(tarjeta);
  guardarDatos();
  res.status(201).json(tarjeta);
});

app.get('/tarjetas', (req, res) => {
  res.json(tarjetas);
});

app.get('/tarjetas/:id', (req, res) => {
  const numeroId = parseInt(req.params.id, 10);
  const tarjetaEncontrada = tarjetas.find((tarjeta) => tarjeta.id === numeroId);
  if (tarjetaEncontrada) {
    res.json(tarjetaEncontrada);
  } else {
    res.status(404).json({ error: 'No se encontró la tarjeta' });
  }
});

app.put('/tarjetas/:id', (req, res) => {
  const numeroId = parseInt(req.params.id, 10);
  const tarjetaEncontrada = tarjetas.find((tarjeta) => tarjeta.id === numeroId);

  if (!tarjetaEncontrada) {
    return res.status(404).json({ error: 'No se encontró la tarjeta' });
  }

  const { palabra, traduccion, definicion, ejemplo } = req.body || {};

  if (!palabra || !traduccion) {
    return res.status(400).json({ error: 'La palabra y la traducción son obligatorias' });
  }

  tarjetaEncontrada.palabra = palabra;
  tarjetaEncontrada.traduccion = traduccion;
  tarjetaEncontrada.definicion = definicion || '';
  tarjetaEncontrada.ejemplo = ejemplo || '';

  guardarDatos();
  res.json(tarjetaEncontrada);
});

app.get('/buscar/:palabra', async (req, res) => {
  const entrada = req.params.palabra;
  const traduccion = await traducir(entrada, 'es', 'en');

  if (traduccion) {
    const definicion = await definir(traduccion);
    res.json({ palabra: entrada, traduccion: traduccion, definicion: definicion });
  } else {
    res.status(502).json({ error: 'No se pudo traducir la palabra' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/`);
});