require('dotenv').config();
import { MusicManager } from './music/MusicManager';
import { ReminderManager } from './reminder/ReminderManager';
import { GeneralManager } from './generic/GeneralManager';
import { WelcomeManager } from './welcome/WelcomeManager';
import { PollManager } from './poll/PollManager';
import { ReminderCache } from './reminder/ReminderCache';
import { LanguageManager } from './language/LanguageManager';
import { Application } from './application';
import { DataStore } from './database/DataStore';
import { ServerCache } from './database/ServerCache';
import { ServerRepository } from './database/ServerRepository';
import { ReminderRepository } from './database/ReminderRepository';

const languageManager = new LanguageManager();

const generalCommandManager = new GeneralManager(
  'General',
  new MusicManager('Music'),
  new ReminderManager('Reminder'),
  new WelcomeManager('Welcome-Leave'),
  new PollManager('Poll')
);

const serverDataStore = new DataStore(
  new ServerCache(),
  new ServerRepository()
);
const reminderDataStore = new DataStore(
  new ReminderCache(),
  new ReminderRepository()
);

const app = new Application(
  languageManager,
  serverDataStore,
  reminderDataStore,
  generalCommandManager
);

app.start(process.env.TOKEN);
