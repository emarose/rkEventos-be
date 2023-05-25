const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    "postgres://postgres:RDq6d19axLHjfWY@rkeventos-db.flycast:5432",
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
