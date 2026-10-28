const express = require('express');
const res = require('express/lib/response');
const app = express();
const PORT = 3000;

// const inicialPalabras = [
//   { ingles: 'hello', traduccion: 'hola', id: 1 },
//   { ingles: 'history', traduccion: 'historia', id: 2 },
//   { ingles: 'how', traduccion: 'cómo', id: 3 }
// ];
const datos = {
  error: 'no se encontro la informacion d'
}

// console.log(inicialPalabras.find(numero => numero.id === 1));

// app.get('/', (req, res) => {
//   res.send(`
//     <h1>PALABRAS EN INGLES</h1>
//     <p>Esto es una aplicación Node.js con Express.js</p>
//     <p>Corre en el puerto ${PORT}</p>
//   `);
// });

// app.get('/palabras', (req, res) => {
//   res.json(inicialPalabras);
// });



// app.get('/palabras/:id', (req, res) => {
//   const numeroId = parseInt(req.params.id);
//   console.log(numeroId);

//   const encontrarPalabra = inicialPalabras.find(numero => numero.id === numeroId)
//   if (encontrarPalabra) {
//     res.json(encontrarPalabra);
//   } else {
//     res.status(404).json(datos.error);
//   }
// });

// app.post('/palabras', (req, res) => {




// })







async function definir(palabra) {
  const respuesta = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${palabra}`);
  if (respuesta.ok) {
    const datosB = await respuesta.json();
    return datosB[0].meanings[0].definitions[0].definition;
  } else null;
}

async function traducir(texto, origen, destino) {
  const respuesta = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=${origen}|${destino}`
  );
  if (respuesta.ok) {
    
      const datos = await respuesta.json();
      if (datos.quotaFinished || Number(datos.responseStatus) != 200) {
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
  console.log(`Servidor corriendo en http://localhost:${PORT}/buscar/:palabra`);
});
