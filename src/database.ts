import monk from 'monk';

const db = monk(process.env.MONGO_URI || 'localhost/bela-discord');

/**
 * Collection to store the reminders, after a restart.
 */
export const reminders = db.get('reminders');

/**
 * Collection to keep track of music channel id's and some roles
 */
export const serverInfo = db.get('server-info');
