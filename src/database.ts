import monk from 'monk';

const db = monk(process.env.MONGO_URI || '127.0.0.1:27017/pillar-discord');

/**
 * Collection to store the reminders, after a restart.
 */
export const reminders = db.get('reminders');

/**
 * Collection to keep track of music channel id's and some roles
 */
export const serverInfo = db.get('server-info');
