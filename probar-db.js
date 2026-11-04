const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function probar() {
  const resultado = await pool.query('SELECT COUNT(*) AS total FROM tarjetas');
  console.log('Tarjetas en la base:', resultado.rows[0].total);
  await pool.end();
}

probar().catch((error) => {
  console.error('Error de conexión:', error.message);
  pool.end();
});