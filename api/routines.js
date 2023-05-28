const express = require('express');
const {
  getAllPublicRoutines,
  createRoutine,
  getRoutineById,
  updateRoutine,
  destroyRoutine,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
} = require('../db');
const deserializeUser = require('../middleware/deserializeUser');
const router = express.Router();

// GET /api/routines
router.get('/', async (req, res, next) => {
  try {
    const routines = await getAllPublicRoutines();

    res.status(200).json(routines);
  } catch (error) {
    next(error);
  }
});

// POST /api/routines
router.post('/', deserializeUser, async (req, res, next) => {
  if (!req.user) {
    return next({
      name: 'AuthorizationHeaderError',
      message: 'You must be logged in to perform this action',
    });
  }

  const { name, goal } = req.body;

  if (!name || !goal) {
    return next({
      name: 'MissingCredentialsError',
      message: 'Please supply both a name and goal',
    });
  }

  try {
    const routine = await createRoutine({
      creatorId: req.user.id,
      ...req.body,
    });

    res.status(200).json(routine);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/routines/:routineId
router.patch('/:routineId', deserializeUser, async (req, res, next) => {
  if (!req.user) {
    return next({
      name: 'AuthorizationHeaderError',
      message: 'You must be logged in to perform this action',
    });
  }

  const { routineId } = req.params;

  try {
    const routine = await getRoutineById(routineId);
    if (routine.creatorId !== req.user.id) {
      res.status(403).json({
        error: 'AuthorizationHeaderError',
        name: 'Error',
        message: `User ${req.user.username} is not allowed to update ${routine.name}`,
      });
      return;
    }

    const updatedRoutine = await updateRoutine({ id: routineId, ...req.body });
    res.status(200).json(updatedRoutine);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/routines/:routineId
router.delete('/:routineId', deserializeUser, async (req, res, next) => {
  const { routineId } = req.params;

  try {
    const routine = await getRoutineById(routineId);
    if (routine.creatorId !== req.user.id) {
      res.status(403).json({
        error: 'AuthorizationHeaderError',
        name: 'Error',
        message: `User ${req.user.username} is not allowed to delete ${routine.name}`,
      });
      return;
    }

    const deletedRoutine = await destroyRoutine(routineId);
    res.status(200).json(deletedRoutine);
  } catch (error) {
    next(error);
  }
});

// POST /api/routines/:routineId/activities
router.post('/:routineId/activities', async (req, res, next) => {
  const { routineId } = req.params;
  try {
    const routineActivities = await getRoutineActivitiesByRoutine({
      id: routineId,
    });

    const isAdded = routineActivities.find(
      routineActivity => routineActivity.activityId === req.body.activityId
    );

    if (isAdded) {
      return res.status(403).json({
        error: 'DuplicateActivity',
        message: `Activity ID ${req.body.activityId} already exists in Routine ID ${routineId}`,
        name: 'Error',
      });
    }
    const routineActivity = await addActivityToRoutine({
      routineId,
      ...req.body,
    });
    res.status(200).json(routineActivity);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
