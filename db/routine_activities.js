const client = require('./client');

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const { rows } = await client.query(
      `
      INSERT INTO routine_activities ("routineId", "activityId", duration, count)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT ("routineId", "activityId") DO NOTHING
      RETURNING *;
      `,
      [routineId, activityId, duration, count]
    );

    const [routineActivity] = rows;
    return routineActivity;
  } catch (error) {
    console.error(error);
  }
}

async function getRoutineActivityById(id) {
  try {
    const { rows } = await client.query(
      `
      SELECT * 
      FROM routine_activities
      WHERE id=$1;
      `,
      [id]
    );

    const [routineActivity] = rows;
    return routineActivity;
  } catch (error) {
    console.error(error);
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows } = await client.query(
      `
      SELECT activities.*,
      routine_activities.duration, routine_activities.count, routine_activities.id as "routineActivityId", routine_activities."routineId"
      FROM activities
      JOIN routine_activities ON routine_activities."activityId"= activities.id
      WHERE "routineId"=$1;
      `,
      [id]
    );

    return rows;
  } catch (error) {
    console.error(error);
  }
}

async function updateRoutineActivity({ id, ...fields }) {}

async function destroyRoutineActivity(id) {}

async function canEditRoutineActivity(routineActivityId, userId) {}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
