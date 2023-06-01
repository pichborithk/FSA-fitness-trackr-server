/* eslint-disable no-useless-catch */
const express = require('express');
const jwt = require('jsonwebtoken');

const { createUser, getUserByUsername, getUser } = require('../db/users');
const { getAllRoutinesByUser, getPublicRoutinesByUser } = require('../db');
const deserializeUser = require('../middleware/deserializeUser');

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

  if (password.length < 8) {
    return next({
      name: 'MissingCredentialsError',
      message: 'Password Too Short!',
    });
  }

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      return next({
        name: 'UserExistsError',
        message: `User ${_user.username} is already taken.`,
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
      // expiresIn: '1w',
    });

    res.status(200).json({
      success: true,
      error: null,
      token,
      message: 'thank you for signing up',
      user: {
        id: user.id,
        username,
      },
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
      // expiresIn: '1w',
    });

    res.status(200).json({
      success: true,
      message: `you're logged in!`,
      token,
      error: null,
      user: {
        id: user.id,
        username,
      },
    });
  } catch (error) {
    next(error);
  }
});
// GET /api/users/me

router.get('/me', async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.headers.authorization;
  if (!auth) {
    return next({
      name: 'AuthorizationHeaderError',
      message: 'You must be logged in to perform this action',
    });
  }
  const token = auth.slice(prefix.length);

  try {
    const { id, username } = jwt.verify(token, process.env.JWT_SECRET);

    res.status(200).json({ id, username });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:username/routines
router.get('/:username/routines', deserializeUser, async (req, res, next) => {
  const { username } = req.params;

  try {
    if (req.user.username === username) {
      const routines = await getAllRoutinesByUser({ username });
      res.status(200).json(routines);
    } else {
      const routines = await getPublicRoutinesByUser({ username });
      res.status(200).json(routines);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
