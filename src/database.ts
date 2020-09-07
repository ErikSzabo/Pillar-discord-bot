import monk from 'monk';

const db = monk('localhost/bela-discord');

/**
 * Collection to store the reminders, after a restart.
 */
export const reminders = db.get('remninders');

/**
 * Collection to keep track of music channel id's and some roles
 */
export const serverInfo = db.get('server-info');
