/* eslint-disable no-useless-catch */
const express = require('express');
const jwt = require('jsonwebtoken');

const { createUser, getUserByUsername, getUser } = require('../db/users');

const router = express.Router();

// POST /api/users/register
router.post('/register', async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return next({
      name: 'MissingCredentialsError',
      message: 'Please supply both a username and password',
    });
  }

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      return next({
        name: 'UserExistsError',
        message: 'A user by that username already exists',
      });
    }

    const user = await createUser({ username, password });

    if (!user || !user.id) {
      return next({
        name: 'Server fail',
        message: 'Fail to register user',
      });
    }

    const token = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET, {
      expiresIn: '1w',
    });

    res.send({
      success: true,
      error: null,
      data: { message: 'thank you for signing up', token },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/login
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return next({
      name: 'MissingCredentialsError',
      message: 'Please supply both a username and password',
    });
  }

  try {
    const user = await getUser({ username, password });
    if (!user || !user.id) {
      return next({
        name: 'IncorrectCredentialsError',
        message: 'Username or password is incorrect',
      });
    }
    const token = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET, {
      expiresIn: '1w',
    });

    res.send({
      success: true,
      error: null,
      data: { message: 'thank you for signing up', token },
    });
  } catch (error) {
    next(error);
  }
});
// GET /api/users/me

// GET /api/users/:username/routines

module.exports = router;
