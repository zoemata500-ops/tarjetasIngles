const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const app = express();
app.use(express.json());
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL en el archivo .env');
  process.exit(1);
}

if (!process.env.CLAVE_EDICION) {
  console.error('Falta CLAVE_EDICION en el archivo .env');
  process.exit(1);
}

function requerirClave(req, res, next) {
  const clave = req.headers['x-clave'];
  if (clave !== process.env.CLAVE_EDICION) {
    return res.status(401).json({ error: 'Clave incorrecta' });
  }
  next();
}

async function definir(palabra) {
  try {
    const traduccionLimpia = palabra.replace(/[.,;:!?]+$/, '').trim();
    const respuesta = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(traduccionLimpia.toLowerCase())}`
    );
    if (!respuesta.ok) {
      return null;
    }
    const datosB = await respuesta.json();
    return datosB[0].meanings[0].definitions[0].definition;
  } catch (error) {
    return null;
  }
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
    const traduccionLimpia = datos.responseData.translatedText.replace(/[.,;:!?]+$/, '').trim();
    return traduccionLimpia;
  }
  return null;
}

app.post('/tarjetas', requerirClave, async (req, res) => {
  const { palabra, traduccion, definicion, ejemplos } = req.body;

  if (!palabra || !traduccion) {
    return res.status(400).json({ error: 'La palabra y la traducción son obligatorias' });
  }

  if (!Array.isArray(ejemplos)) {
    return res.status(400).json({ error: 'ejemplos debe ser un arreglo' });
  }

  const ejemplosTexto = JSON.stringify(ejemplos);

  try {
    const resultado = await pool.query(
      'INSERT INTO tarjetas (palabra, traduccion, definicion, ejemplos_adicionales) VALUES ($1, $2, $3, $4) RETURNING *',
      [palabra, traduccion, definicion || '', ejemplosTexto]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al guardar la tarjeta' });
  }
});

app.put('/tarjetas/:id', requerirClave, async (req, res) => {
  const numeroId = parseInt(req.params.id, 10);

  if (Number.isNaN(numeroId)) {
    return res.status(404).json({ error: 'No se encontró la tarjeta' });
  }

  const { palabra, traduccion, definicion, ejemplos } = req.body;

  if (!palabra || !traduccion) {
    return res.status(400).json({ error: 'La palabra y la traducción son obligatorias' });
  }

  if (!Array.isArray(ejemplos)) {
    return res.status(400).json({ error: 'ejemplos debe ser un arreglo' });
  }

  const ejemplosTexto = JSON.stringify(ejemplos);

  try {
    const resultado = await pool.query(
      'UPDATE tarjetas SET palabra = $1, traduccion = $2, definicion = $3, ejemplos_adicionales = $4 WHERE id = $5 RETURNING *',
      [palabra, traduccion, definicion || '', ejemplosTexto, numeroId]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró la tarjeta' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la tarjeta' });
  }
});

app.get('/tarjetas', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM tarjetas ORDER BY id');
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al leer las tarjetas' });
  }
});

app.get('/tarjetas/:id', async (req, res) => {
  const numeroId = parseInt(req.params.id, 10);

  if (Number.isNaN(numeroId)) {
    return res.status(404).json({ error: 'No se encontró la tarjeta' });
  }

  try {
    const resultado = await pool.query('SELECT * FROM tarjetas WHERE id = $1', [numeroId]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró la tarjeta' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al leer la tarjeta' });
  }
});

app.get('/buscar/:palabra', async (req, res) => {
  const entrada = req.params.palabra;

  try {
    const traduccion = await traducir(entrada, 'es', 'en');

    if (!traduccion) {
      return res.status(502).json({ error: 'No se pudo traducir la palabra' });
    }

    const definicion = await definir(traduccion);
    res.json({ palabra: entrada, traduccion: traduccion, definicion: definicion });
  } catch (error) {
    console.error(error);
    res.status(502).json({ error: 'No se pudo consultar el servicio externo' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/`);
});