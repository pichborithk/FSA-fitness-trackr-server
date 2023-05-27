const express = require('express');
const router = express.Router();

// GET /api/health
router.get('/health', async (req, res) => {
  res.status(200).json({ message: 'Server up and running' });
});

// ROUTER: /api/users
const usersRouter = require('./users');
router.use('/users', usersRouter);

// ROUTER: /api/activities
const activitiesRouter = require('./activities');
router.use('/activities', activitiesRouter);

// ROUTER: /api/routines
const routinesRouter = require('./routines');
router.use('/routines', routinesRouter);

// ROUTER: /api/routine_activities
const routineActivitiesRouter = require('./routineActivities');
router.use('/routine_activities', routineActivitiesRouter);

router.use((error, req, res, next) => {
  res.status(401).json({
    error: error.name,
    message: error.message,
    name: 'Error',
  });
});

module.exports = router;
