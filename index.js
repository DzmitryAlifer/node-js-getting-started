const cool = require('cool-ascii-faces');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false},
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => res.render('pages/index'));
app.get('/cool', (req, res) => res.send(cool()));
app.get('/users', async (request, response) => {
    try {
      const client = await pool.connect();
      const databaseResponse = await client.query('SELECT * FROM users');
      const results = { 'results': (databaseResponse) ? databaseResponse.result : null};
      console.log(results);
      // response.render('pages/db', results);
      response.status(200).json(results);
      client.release();
    } catch (err) {
      console.error(err);
      response.send('Error: ' + err);
    }
  });
// app.get('/users2', getUsers);
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

  const getUsers = (request, response) => {
  //   pool.query('SELECT * FROM users', (error, results) => {
  //     if (error) {
  //         throw error;
  //     }
  
  //     response.status(200).json(results.rows);
  //   });
  };