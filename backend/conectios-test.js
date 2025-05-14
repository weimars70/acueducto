const { Client } = require('pg');

async function ejecutarConsulta() {
  const client = new Client({
    host: '108.181.193.178',
    user: 'weymars',
    password: '##LosHijos162025@@?!',
    port: 5433,
    database: 'socorro',
  });

  try {
    await client.connect();
    const res = await client.query('SELECT * FROM USERS');
    console.log(res.rows);
  } catch (err) {
    console.error('Error al ejecutar la consulta', err);
  } finally {
    await client.end();
  }
}

ejecutarConsulta();