const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL en el archivo .env');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const tarjetas = [
  {
    palabra: 'puerta',
    traduccion: 'door',
    ejemplos: [
      ['Please close the door.', 'Por favor, cierra la puerta.'],
      ['Someone is at the door.', 'Alguien está en la puerta.'],
      ['The door is open.', 'La puerta está abierta.'],
      ['Can you open the door for me?', '¿Me abres la puerta?'],
      ['I locked the door.', 'Cerré la puerta con llave.']
    ]
  },
  {
    palabra: 'mesa',
    traduccion: 'table',
    ejemplos: [
      ['My phone is on the table.', 'Mi teléfono está en la mesa.'],
      ['The table is very big.', 'La mesa es muy grande.'],
      ['The salt is on the table.', 'La sal está en la mesa.'],
      ['Dinner is on the table.', 'La cena está en la mesa.'],
      ['Can you set the table?', '¿Puedes poner la mesa?']
    ]
  },
  {
    palabra: 'silla',
    traduccion: 'chair',
    ejemplos: [
      ['Have a seat on that chair.', 'Siéntate en esa silla.'],
      ['This chair is very comfortable.', 'Esta silla es muy cómoda.'],
      ['Pull up a chair.', 'Acerca una silla.'],
      ['There is a bag on the chair.', 'Hay una bolsa en la silla.'],
      ['I need another chair.', 'Necesito otra silla.']
    ]
  },
  {
    palabra: 'llaves',
    traduccion: 'keys',
    ejemplos: [
      ['Where are my keys?', '¿Dónde están mis llaves?'],
      ['I lost my keys.', 'Perdí mis llaves.'],
      ['The keys are on the table.', 'Las llaves están en la mesa.'],
      ['Don’t forget your keys.', 'No olvides tus llaves.'],
      ['I left my keys at home.', 'Dejé mis llaves en casa.']
    ]
  },
  {
    palabra: 'cama',
    traduccion: 'bed',
    ejemplos: [
      ['I’m going to bed.', 'Me voy a la cama.'],
      ['Make your bed.', 'Tiende tu cama.'],
      ['The bed is very soft.', 'La cama es muy suave.'],
      ['I stayed in bed all morning.', 'Me quedé en la cama toda la mañana.'],
      ['Get out of bed!', '¡Levántate de la cama!']
    ]
  },
  {
    palabra: 'ventana',
    traduccion: 'window',
    ejemplos: [
      ['Open the window, please.', 'Abre la ventana, por favor.'],
      ['It’s cold. Close the window.', 'Hace frío. Cierra la ventana.'],
      ['Look out the window.', 'Mira por la ventana.'],
      ['The window is broken.', 'La ventana está rota.'],
      ['I like the seat by the window.', 'Me gusta el asiento junto a la ventana.']
    ]
  },
  {
    palabra: 'refrigerador',
    traduccion: 'fridge',
    ejemplos: [
      ['The milk is in the fridge.', 'La leche está en el refrigerador.'],
      ['Is there any food in the fridge?', '¿Hay comida en el refrigerador?'],
      ['Put it back in the fridge.', 'Vuelve a ponerlo en el refrigerador.'],
      ['The fridge is empty.', 'El refrigerador está vacío.'],
      ['Close the fridge door.', 'Cierra la puerta del refrigerador.']
    ]
  },
  {
    palabra: 'vaso',
    traduccion: 'glass',
    ejemplos: [
      ['Can I have a glass of water?', '¿Me das un vaso de agua?'],
      ['The glass is empty.', 'El vaso está vacío.'],
      ['Be careful, the glass is broken.', 'Ten cuidado, el vaso está roto.'],
      ['Fill the glass with juice.', 'Llena el vaso con jugo.'],
      ['I drank a glass of milk.', 'Me tomé un vaso de leche.']
    ]
  },
  {
    palabra: 'taza',
    traduccion: 'cup',
    ejemplos: [
      ['I’d like a cup of coffee.', 'Quisiera una taza de café.'],
      ['The cup is hot.', 'La taza está caliente.'],
      ['Put the cup on the table.', 'Pon la taza en la mesa.'],
      ['She broke my favorite cup.', 'Ella rompió mi taza favorita.'],
      ['Do you want a cup of tea?', '¿Quieres una taza de té?']
    ]
  },
  {
    palabra: 'libro',
    traduccion: 'book',
    ejemplos: [
      ['I’m reading a good book.', 'Estoy leyendo un buen libro.'],
      ['Open your book to page ten.', 'Abre tu libro en la página diez.'],
      ['Can I borrow this book?', '¿Me prestas este libro?'],
      ['I left my book at school.', 'Dejé mi libro en la escuela.'],
      ['This book is very interesting.', 'Este libro es muy interesante.']
    ]
  }
];

async function cargar() {
  const cliente = await pool.connect();

  try {
    await cliente.query('BEGIN');
    await cliente.query('TRUNCATE tarjetas RESTART IDENTITY');

    for (const tarjeta of tarjetas) {
      const ejemplos = tarjeta.ejemplos.map(([ingles, espanol]) => ({ ingles, espanol }));

      await cliente.query(
        'INSERT INTO tarjetas (palabra, traduccion, definicion, ejemplos_adicionales) VALUES ($1, $2, $3, $4)',
        [tarjeta.palabra, tarjeta.traduccion, '', JSON.stringify(ejemplos)]
      );
    }

    await cliente.query('COMMIT');
    console.log(`Listo: ${tarjetas.length} tarjetas cargadas, con ids del 1 al ${tarjetas.length}`);
  } catch (error) {
    await cliente.query('ROLLBACK');
    console.error('Falló la carga, no se cambió nada:', error);
  } finally {
    cliente.release();
    await pool.end();
  }
}

cargar();


