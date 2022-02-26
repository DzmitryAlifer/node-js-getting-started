const Pool = require('pg').Pool;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false},
});

const getUsers = (request, response) => {
  const client = await pool.connect();
  const resultSet = await client.query(GET_ALL_USERS);
  response.json(resultSet.rows);
  client.release();
};

module.exports = {
  getUsers,
};
