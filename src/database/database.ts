import monk from 'monk';

export const db = monk(
  process.env.MONGO_URI || '127.0.0.1:27017/pillar-discord'
);
