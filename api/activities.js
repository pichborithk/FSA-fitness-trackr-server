const express = require('express');
const {
  getAllActivities,
  createActivity,
  getActivityByName,
  getActivityById,
  updateActivity,
} = require('../db/activities');
const deserializeUser = require('../middleware/deserializeUser');
const { getPublicRoutinesByActivity } = require('../db');
const router = express.Router();

// GET /api/activities/:activityId/routines
router.get('/:activityId/routines', async (req, res, next) => {
  const { activityId } = req.params;

  try {
    const activity = await getActivityById(activityId);
    if (!activity) {
      return next({
        name: 'NotFound',
        message: `Activity ${activityId} not found`,
      });
    }

    const routines = await getPublicRoutinesByActivity({ id: activityId });
    res.status(200).json(routines);
  } catch (error) {
    next(error);
  }
});

// GET /api/activities
router.get('/', async (req, res, next) => {
  try {
    const activities = await getAllActivities();

    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
});

// POST /api/activities
router.post('/', deserializeUser, async (req, res, next) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return next({
      name: 'MissingCredentialsError',
      message: 'Please supply both a name and description',
    });
  }

  if (!req.user) {
    return next({
      name: 'AuthorizationHeaderError',
      message: 'You must be logged in to perform this action',
    });
  }

  try {
    const _activity = await getActivityByName(name);
    if (_activity) {
      return next({
        name: 'DuplicateRequest',
        message: `An activity with name ${name} already exists`,
      });
    }
    const activity = await createActivity({ name, description });

    res.status(200).json(activity);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/activities/:activityId
router.patch('/:activityId', async (req, res, next) => {
  const { activityId } = req.params;
  // if (!req.user) {
  //   return next({
  //     name: 'AuthorizationHeaderError',
  //     message: 'You must be logged in to perform this action',
  //   });
  // }

  try {
    const activity = await getActivityById(activityId);
    if (!activity) {
      return next({
        name: 'NotFound',
        message: `Activity ${activityId} not found`,
      });
    }

    if (req.body.name) {
      const _activity = await getActivityByName(req.body.name);

      if (_activity && _activity.id !== activityId) {
        return next({
          name: 'DuplicateRequest',
          message: `An activity with name ${req.body.name} already exists`,
        });
      }
    }

    const updatedActivity = await updateActivity({
      id: activityId,
      ...req.body,
    });
    res.status(200).json(updatedActivity);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
