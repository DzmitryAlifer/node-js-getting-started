const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const {Pool} = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false},
});


const GET_ALL_USERS_SQL = 'SELECT id, username, firstname, lastname FROM users;';
const GET_USER_BY_ID_SQL = 'SELECT id, username, firstname, lastname FROM users WHERE id = $1;';
const LOG_IN_SQL = 'SELECT id, username, firstname, lastname FROM users WHERE username = $1 AND password = $2;';
const CREATE_USER_SQL = 'insert into public.users (username, password, firstname, lastname) values ($1, $2, $3, $4);';
const GET_USER_BY_ID_SQL = 'SELECT id, username, firstname, lastname FROM users WHERE id = $1;';


const getUserById = async (request, response) => {
  const id = parseInt(request.params.id);
  const client = await pool.connect();
  const resultSet = await client.query(GET_USER_BY_ID_SQL, [id]);
  response.json(resultSet.rows[0]);
  client.release();
};

const createUser = async (request, response) => {
  const params = [request.body.username, request.body.password, request.body.firstname, request.body.lastname];
  const client = await pool.connect();
  const resultSet = await client.query(CREATE_USER_SQL, params);
  response.json(resultSet.rows[0]);
  client.release();
};

const login = async (request, response) => {
  const params = [request.body.username, request.body.password];
  const client = await pool.connect();
  const resultSet = await client.query(LOG_IN_SQL, params);
  resultSet.rows.length === 1 ? 
      response.status(200).json(resultSet.rows[0]) : 
      response.status(401).json(null);
  client.release();
};


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
app.get('/users', async (request, response) => {
  const client = await pool.connect();
  const resultSet = await client.query(GET_ALL_USERS_SQL);
  response.json(resultSet.rows);
  client.release();
});
app.get('/users/:id', getUserById);
app.post('/users', createUser);
app.post('/login', login);
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));