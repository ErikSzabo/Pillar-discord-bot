import { Client } from 'discord.js';
import config from './config';
import { MusicManager } from './music/MusicManager';
import { ReminderManager } from './reminder/ReminderManager';
import { GeneralManager } from './generic/GeneralManager';
import { generalServerCache } from './generic/GeneralServerCache';

require('dotenv').config();

const client = new Client();
const musicManager = new MusicManager('Music');
const reminderManager = new ReminderManager('Reminder');
const generalManager = new GeneralManager(
  'General',
  musicManager,
  reminderManager
);

client.once('ready', () => {
  console.log("I'm ready!");
  client.user.setActivity({ type: 'LISTENING', name: '!help' });
  generalServerCache.loadCache();
});

client.on('message', (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith(config.prefix)) {
    const [command, ...args] = message.content
      .trim()
      .substring(config.prefix.length)
      .split(/\s+/);

    if (generalManager.getCommandNames().includes(command)) {
      generalManager.handle(command, args, message);
      return;
    }

    if (musicManager.getCommandNames().includes(command)) {
      musicManager.handle(command, args, message);
      return;
    }
  }
});

client.on('guildCreate', (guild) => {
  generalServerCache.saveToCache(guild.id);
});

client.on('guildDelete', (guild) => {
  generalServerCache.fullRemove(guild.id);
});

client.login(process.env.TOKEN);
