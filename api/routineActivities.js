const express = require('express');
const deserializeUser = require('../middleware/deserializeUser');
const {
  canEditRoutineActivity,
  updateRoutineActivity,
  getRoutineActivityById,
  destroyRoutineActivity,
} = require('../db');
const router = express.Router();

// PATCH /api/routine_activities/:routineActivityId
router.patch('/:routineActivityId', deserializeUser, async (req, res, next) => {
  const { routineActivityId } = req.params;

  if (!req.user) {
    return next({
      name: 'AuthorizationHeaderError',
      message: 'You must be logged in to perform this action',
    });
  }
  try {
    const routineActivity = await getRoutineActivityById(routineActivityId);

    const isOwner = await canEditRoutineActivity(
      routineActivityId,
      req.user.id
    );

    if (!isOwner) {
      next({
        name: 'AuthorizationHeaderError',
        message: `User ${req.user.username} is not allowed to update ${routineActivity.name}`,
      });
    }

    const updatedRoutineActivity = await updateRoutineActivity({
      id: routineActivityId,
      ...req.body,
    });
    res.status(200).json(updatedRoutineActivity);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/routine_activities/:routineActivityId
router.delete(
  '/:routineActivityId',
  deserializeUser,
  async (req, res, next) => {
    const { routineActivityId } = req.params;
    if (!req.user) {
      return next({
        name: 'AuthorizationHeaderError',
        message: 'You must be logged in to perform this action',
      });
    }
    try {
      const routineActivity = await getRoutineActivityById(routineActivityId);

      const isOwner = await canEditRoutineActivity(
        routineActivityId,
        req.user.id
      );

      if (!isOwner) {
        res.status(403).json({
          error: 'AuthorizationHeaderError',
          message: `User ${req.user.username} is not allowed to delete ${routineActivity.name}`,
          name: 'Error',
        });
      }

      const deletedRoutineActivity = await destroyRoutineActivity(
        routineActivityId
      );

      res.status(200).json(deletedRoutineActivity);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
