require('dotenv').config();
import config from './config';
import { MusicManager } from './music/MusicManager';
import { ReminderManager } from './reminder/ReminderManager';
import { GeneralManager } from './generic/GeneralManager';
import { serverCache } from './generic/ServerCache';
import { WelcomeManager } from './welcome/WelcomeManager';
import { reminderCache } from './reminder/ReminderCache';
import { client } from './client';
import { serverRepository } from './database/ServerRepository';
import { reminderRepository } from './database/ReminderRepository';
import { createServerConstruct, handleWelcomeLeaveMessage } from './utils';
import { language } from './language/LanguageManager';

const musicManager = new MusicManager('Music');
const reminderManager = new ReminderManager('Reminder');
const welcomeManager = new WelcomeManager('Welcome-Leave');
const generalManager = new GeneralManager(
  'General',
  musicManager,
  reminderManager,
  welcomeManager
);

client.once('ready', async () => {
  console.log("I'm ready!");
  client.user.setActivity({
    type: config.beta ? 'PLAYING' : 'LISTENING',
    name: config.beta ? 'Open Beta' : `${config.prefix}help`,
  });
  await serverCache.loadFromDatastore(serverRepository);
  await reminderCache.loadFromDatastore(reminderRepository);
});

client.on('message', (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith(config.prefix)) {
    const [command, ...args] = message.content
      .trim()
      .substring(config.prefix.length)
      .split(/\s+/);

    if (message.author.id === config.operator) {
      if (command === 'reload') {
        return language
          .reload()
          .then(() => message.channel.send('Language files reloaded'))
          .catch((err) =>
            message.channel.send('Error while reloading language files.')
          );
      }
    }

    generalManager.handle(command, args, message);
  }
});

client.on('guildCreate', async (guild) => {
  if (!serverCache.canJoin()) {
    await guild.leave();
    return;
  }
  const { id } = guild;
  serverCache.add(id, createServerConstruct(id));
  serverRepository.add(id, createServerConstruct(id));
});

client.on('guildDelete', (guild) => {
  serverCache.remove(guild.id);
  serverRepository.delete(guild.id);
});

client.on('guildMemberAdd', (member) => {
  handleWelcomeLeaveMessage('welcomeMessage', member);
});

client.on('guildMemberRemove', (member) => {
  handleWelcomeLeaveMessage('leaveMessage', member);
});

client.login(process.env.TOKEN);
