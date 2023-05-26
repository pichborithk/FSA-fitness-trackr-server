const { Pool } = require('pg');

const connectionString =
  process.env.DATABASE_URL || 'postgresql://localhost:5432/fitness-dev';

const client = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : undefined,
});

// const { Client } = require('pg');

// const client = new Client(connectionString);
// client.connect();

module.exports = client;
