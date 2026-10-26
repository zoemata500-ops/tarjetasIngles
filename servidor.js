const express = require('express');
const app = express();
const PORT = 3000;

const inicialPalabras = [
  { ingles: 'hello', traduccion: 'hola', id: 1 },
  { ingles: 'history', traduccion: 'historia', id:2 },
  { ingles: 'how', traduccion: 'cómo', id: 3 }
];
 const datos = {
  error: 'no se encontro la informacion d'
 }

console.log(inicialPalabras.find(numero => numero.id === 1));

app.get('/', (req, res) => {
  res.send(`
    <h1>PALABRAS EN INGLES</h1>
    <p>Esto es una aplicación Node.js con Express.js</p>
    <p>Corre en el puerto ${PORT}</p>
  `);
});

app.get('/palabras', (req, res) => {
  res.json(inicialPalabras);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

app.get('/palabras/:id', (req, res) => { 
  const numeroId = parseInt(req.params.id);
  console.log(numeroId);
  
  const encontrarPalabra = inicialPalabras.find( numero => numero.id === numeroId) 
  if (encontrarPalabra ){
    res.json(encontrarPalabra);
  }else {
    res.status(404).json(datos.error);
  }
 });


