const client = require('./client');
const { addActivityToRoutine } = require('./routine_activities');

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const { rows } = await client.query(
      `
      INSERT INTO routines (name, goal, "creatorId", "isPublic")
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (name) DO NOTHING
      RETURNING *;
      `,
      [name, goal, creatorId, isPublic]
    );

    const [routine] = rows;
    return routine;
  } catch (error) {
    console.error(error);
  }
}

async function getRoutineById(id) {
  try {
    const { rows } = await client.query(
      `
      SELECT * 
      FROM routines
      WHERE id=$1;
      `,
      [id]
    );

    const [routine] = rows;
    return routine;
  } catch (error) {
    console.error(error);
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows } = await client.query(
      `
      SELECT * 
      FROM routines;
      `
    );

    return rows;
  } catch (error) {
    console.error(error);
  }
}

async function getAllRoutines() {
  try {
    const routines = await getRoutinesWithoutActivities();

    await addActivityToRoutine(routines);

    return;
  } catch (error) {
    console.error(error);
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows } = await client.query(
      `
      SELECT * 
      FROM routines
      WHERE "isPublic"=true;
      `
    );

    await addActivityToRoutine(rows);
    return rows;
  } catch (error) {
    console.error(error);
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows } = await client.query(
      `
      SELECT routines.* , users.username as "creatorName"
      FROM routines
      JOIN username
      WHERE username=$1;
      `,
      [username]
    );

    await addActivityToRoutine(rows);
    return rows;
  } catch (error) {
    console.error(error);
  }
}

async function getPublicRoutinesByUser({ username }) {}

async function getPublicRoutinesByActivity({ id }) {}

async function updateRoutine({ id, ...fields }) {}

async function destroyRoutine(id) {}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
