const cool = require('cool-ascii-faces');
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false},
});

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://safe-crag-81937.herokuapp.com/users');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  })
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/cool', (req, res) => res.send(cool()))
  .get('/users', async (request, response) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM users');
      const results = { 'results': (result) ? result.rows : null};
      console.log(results);
      response.render('pages/db', results);
      client.release();
    } catch (err) {
      console.error(err);
      response.send('Error: ' + err);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
