const { Pool } = require("pg");

/* const pool = new Pool({
  connectionString:
    "postgres://postgres:RDq6d19axLHjfWY@rkeventos-db.flycast:5432",
}); */

const pool = new Pool();

module.exports = {
  query: (text, params) => pool.query(text, params),
};
