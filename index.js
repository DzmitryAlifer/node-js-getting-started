const express = require('express');
const app = express();
const path = require('path');
const url = require('url');
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const {Pool} = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false},
});


const GET_ALL_USERS_SQL = 'SELECT id, username, firstname, lastname, seasonpoints FROM users;';
const GET_USER_BY_ID_SQL = 'SELECT id, username, firstname, lastname FROM users WHERE id = $1;';
const LOG_IN_SQL = 'SELECT id, username, firstname, lastname FROM users WHERE username = $1 AND password = $2;';
const CREATE_USER_SQL = 'INSERT INTO users (username, password, firstname, lastname) VALUES ($1, $2, $3, $4);';

const GET_ALL_PREDICTIONS_SQL = 'SELECT * FROM predictions;';
const GET_ALL_USER_PREDICTIONS_SQL = 'SELECT * FROM predictions WHERE userId = $1;';
const GET_PREDICTION_SQL = 'SELECT * FROM predictions WHERE userId = $1 AND round = $2;';
const POST_PREDICTION_SQL = 'INSERT INTO predictions (userid, round, qualification, race) VALUES ($1, $2, $3, $4);'
const UPDATE_PREDICTION_SQL = 'UPDATE predictions SET qualification = $3, race = $4 WHERE userid = $1 and round = $2;';

const GET_RESULT_SQL = 'SELECT * FROM results WHERE year = $1 AND round = $2;';
const POST_RESULT_SQL = 'INSERT INTO results (year, round, qualifying, race) VALUES ($1, $2, $3, $4);'
const UPDATE_RESULT_SQL = 'UPDATE results SET qualifying = $3, race = $4 WHERE year = $1 and round = $2;';


const getAllUsers = async (request, response) => {
  const client = await pool.connect();
  const resultSet = await client.query(GET_ALL_USERS_SQL);
  response.json(resultSet.rows);
  client.release();
};

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

const getAllPredictions = async (request, response) => {
  const client = await pool.connect();
  const resultSet = await client.query(GET_ALL_PREDICTIONS_SQL);
  response.json(resultSet.rows);
  client.release();
};

const getAllUserPredictions = async (request, response) => {
  const {userId} = url.parse(request.url, true).query;
  const client = await pool.connect();
  const resultSet = await client.query(GET_ALL_USER_PREDICTIONS_SQL, [userId]);
  response.json(resultSet.rows);
  client.release();
};

const getPrediction = async (request, response) => {
  const {userId, round} = url.parse(request.url, true).query;
  const client = await pool.connect();
  const resultSet = await client.query(GET_PREDICTION_SQL, [userId, round]);
  const lastPredictionIndex = resultSet.rows.length - 1;
  response.json(resultSet.rows[lastPredictionIndex]);
  client.release();
};

const addPrediction = async (request, response) => {
  const params = [request.body.userid, request.body.round, request.body.qualification, request.body.race];
  const client = await pool.connect();
  const resultSet = await client.query(POST_PREDICTION_SQL, params);
  const lastPredictionIndex = resultSet.rows.length - 1;
  response.json(resultSet.rows[lastPredictionIndex]);
  client.release();
};

const updatePrediction = async (request, response) => {
  const params = [request.body.userid, request.body.round, request.body.qualification, request.body.race];
  const client = await pool.connect();
  const resultSet = await client.query(UPDATE_PREDICTION_SQL, params);
  const lastPredictionIndex = resultSet.rows.length - 1;
  response.json(resultSet.rows[lastPredictionIndex]);
  client.release();
};

const getResult = async (request, response) => {
  const {year, round} = url.parse(request.url, true).query;
  const client = await pool.connect();
  const resultSet = await client.query(GET_RESULT_SQL, [year, round]);
  const lastPredictionIndex = resultSet.rows.length - 1;
  response.json(resultSet.rows[lastPredictionIndex]);
  client.release();
};

const addResult = async (request, response) => {
  const params = [request.body.year, request.body.round, request.body.qualifying, request.body.race];
  const client = await pool.connect();
  const resultSet = await client.query(POST_RESULT_SQL, params);
  const lastPredictionIndex = resultSet.rows.length - 1;
  response.json(resultSet.rows[lastPredictionIndex]);
  client.release();
};

const updateResult = async (request, response) => {
  const params = [request.body.year, request.body.round, request.body.qualifying, request.body.race];
  const client = await pool.connect();
  const resultSet = await client.query(UPDATE_RESULT_SQL, params);
  const lastPredictionIndex = resultSet.rows.length - 1;
  response.json(resultSet.rows[lastPredictionIndex]);
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

app.get('/users', getAllUsers);
app.get('/users/:id', getUserById);
app.post('/users', createUser);
app.post('/login', login);

app.get('/prediction', getAllPredictions);
app.get('/prediction', getAllUserPredictions);
app.get('/prediction', getPrediction);
app.post('/prediction', addPrediction);
app.put('/prediction', updatePrediction);

app.get('/result', getResult);
app.post('/result', addResult);
app.put('/result', updateResult);

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
