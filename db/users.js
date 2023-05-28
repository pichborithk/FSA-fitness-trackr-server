const bcrypt = require('bcrypt');
require('dotenv').config();

const client = require('./client');

// database functions

// user functions
async function createUser({ username, password }) {
  const hash = await bcrypt.hash(password, Number(process.env.SALT));
  try {
    const { rows } = await client.query(
      `
      INSERT INTO users (username, password)
      VALUES ($1, $2)
      ON CONFLICT (username) DO NOTHING
      RETURNING *;
      `,
      [username, hash]
    );

    if (!rows || rows.length <= 0) {
      return null;
    }

    const [user] = rows;
    delete user.password;
    return user;
  } catch (error) {
    console.error(error);
  }
}

async function getUser({ username, password }) {
  try {
    const user = await getUserByUsername(username);

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }

    delete user.password;
    return user;
  } catch (error) {
    console.error(error);
  }
}

async function getUserById(userId) {
  try {
    const { rows } = await client.query(
      `
      SELECT id, username
      FROM users
      WHERE id=$1
      `,
      [userId]
    );

    const [user] = rows;
    return user;
  } catch (error) {
    console.error(error);
  }
}

async function getUserByUsername(username) {
  try {
    const { rows } = await client.query(
      `
      SELECT *
      FROM users
      WHERE username=$1
      `,
      [username]
    );

    const [user] = rows;
    return user;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
};
