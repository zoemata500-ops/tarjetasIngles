const express = require('express');
const app = express();
const PORT = 3000;
app.use(express.json());
app.use(express.static('public'));
async function definir(palabra) {
  const respuesta = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${palabra}`);
  if (respuesta.ok) {
    const datosB = await respuesta.json();
    return datosB[0].meanings[0].definitions[0].definition;
  } else return null;
}


const tarjetas = [];
let siguienteId = 1;

app.post('/tarjetas', (req, res) => {
  const { palabra, traduccion, definicion } = req.body || {};
  if (!palabra || !traduccion) {
    return res.status(400).json({ error: 'La palabra y la traducción son obligatorias' });
  }
  const tarjeta = {
    id: siguienteId,
    palabra: palabra,
    traduccion: traduccion,
    definicion: definicion || ''
  };
  siguienteId++;
  tarjetas.push(tarjeta);
  res.status(201).json(tarjeta);
});

app.get('/tarjetas', (req, res) => {
  res.json(tarjetas);
});

app.get('/tarjetas/:id', (req, res) => {
  const entrada = req.params.id;
  const numeroId = parseInt(entrada);
  const encontrarTarjeta = tarjetas.find((tarjetas) => tarjetas.id === numeroId);
  if (encontrarTarjeta) {
    res.json(encontrarTarjeta);
  } else {
    res.status(404).json({ mensaje: "la tarjeta no se encontró" });
  }

});
app.put('/tarjetas/:id', (req, res) => {
  const entrada = req.params.id;
  const numeroId = parseInt(entrada);
  const encontrarTarjeta = tarjetas.find((tarjeta) => tarjeta.id === numeroId);
  if (!encontrarTarjeta) {
    res.status(404).json({ error: "no se encontro la tarjeta" })
    return
  } else {


  
  const { palabra, traduccion, definicion } = req.body || {};
  encontrarTarjeta.palabra = palabra;
  encontrarTarjeta.traduccion = traduccion || {};
  encontrarTarjeta.definicion = definicion || {};
  if (encontrarTarjeta.traduccion == ""){
    res.status(404).json({ error: "se requiere una traducción" })
    return
  }
  res.json(encontrarTarjeta);


  }
  // 6. Cambiar las propiedades de la tarjeta encontrada

  // 7. Responder con la tarjeta actualizada
});




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

app.get('/buscar/:palabra', async (req, res) => {
  const entrada = req.params.palabra;
  const traduccion = await traducir(entrada, 'es', 'en');


  if (traduccion) {
    const definicion = await definir(traduccion)
    res.json({ palabra: entrada, traduccion: traduccion, definicion: definicion });
  } else {
    res.status(502).json({ error: 'No se pudo traducir la palabra' });

  }
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/buscar/`);
});
