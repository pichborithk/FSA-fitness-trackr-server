const client = require('./client');
const { getRoutineActivitiesByRoutine } = require('./routine_activities');

// database functions
async function createActivity({ name, description }) {
  // return the new activity
  try {
    const { rows } = await client.query(
      `
      INSERT INTO activities (name, description)
      VALUES ($1, $2)
      ON CONFLICT (name) DO NOTHING
      RETURNING *;
      `,
      [name.toLowerCase(), description]
    );

    const [activity] = rows;
    return activity;
  } catch (error) {
    console.error(error);
  }
}

async function getAllActivities() {
  // select and return an array of all activities
  try {
    const { rows } = await client.query(
      `
      SELECT * 
      FROM activities;
      `
    );

    return rows;
  } catch (error) {
    console.error(error);
  }
}

async function getActivityById(id) {
  try {
    const { rows } = await client.query(
      `
      SELECT * 
      FROM activities
      WHERE id=$1;
      `,
      [id]
    );

    const [activity] = rows;
    return activity;
  } catch (error) {
    console.error(error);
  }
}

async function getActivityByName(name) {
  try {
    const { rows } = await client.query(
      `
      SELECT id, name 
      FROM activities
      WHERE name=$1;
      `,
      [name]
    );

    const [activity] = rows;
    return activity;
  } catch (error) {
    console.error(error);
  }
}

// used as a helper inside db/routines.js
async function attachActivitiesToRoutines(routines) {
  for (let routine of routines) {
    routine.activities = await getRoutineActivitiesByRoutine({
      id: routine.id,
    });
  }
}

async function updateActivity({ id, ...fields }) {
  // don't try to update the id
  // do update the name and description
  // return the updated activity
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(', ');

  try {
    const { rows } = await client.query(
      `
      UPDATE posts
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
      `,
      Object.values(fields)
    );

    const [activity] = rows;
    return activity;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
