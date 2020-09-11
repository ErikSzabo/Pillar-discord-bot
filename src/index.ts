require('dotenv').config();
import { Client, GuildMember, PartialGuildMember } from 'discord.js';
import config from './config';
import { MusicManager } from './music/MusicManager';
import { ReminderManager } from './reminder/ReminderManager';
import { GeneralManager } from './generic/GeneralManager';
import { serverCache, channelType, messageType } from './generic/ServerCache';
import { WelcomeManager } from './welcome/WelcomeManager';
import { reminderCache } from './reminder/ReminderCache';

const client = new Client();
const musicManager = new MusicManager('Music');
const reminderManager = new ReminderManager('Reminder');
const welcomeManager = new WelcomeManager('Welcome-Leave');
const generalManager = new GeneralManager(
  'General',
  musicManager,
  reminderManager,
  welcomeManager
);

client.once('ready', () => {
  console.log("I'm ready!");
  client.user.setActivity({ type: 'LISTENING', name: '!help' });
  serverCache.loadCache();
  reminderCache.loadAndSetup(client);
});

client.on('message', (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith(config.prefix)) {
    const [command, ...args] = message.content
      .trim()
      .substring(config.prefix.length)
      .split(/\s+/);

    generalManager.handle(command, args, message);
  }
});

client.on('guildCreate', (guild) => {
  serverCache.saveToCache(guild.id);
});

client.on('guildDelete', (guild) => {
  serverCache.fullRemove(guild.id);
});

client.on('guildMemberAdd', (member) => {
  handleWelcomeLeaveMessage(messageType.WELCOME, member);
});

client.on('guildMemberRemove', (member) => {
  handleWelcomeLeaveMessage(messageType.LEAVE, member);
});

client.login(process.env.TOKEN);

function handleWelcomeLeaveMessage(
  messageType: messageType,
  member: GuildMember | PartialGuildMember
): void {
  const welcomeChannel = serverCache.getChannel(
    channelType.WELCOME,
    member.guild.id
  );
  const message = serverCache.getMessage(messageType, member.guild.id);

  if (welcomeChannel === 'off' || message === 'off') return;

  let realChannel = member.guild.channels.cache.get(welcomeChannel);
  if (realChannel.type !== 'text') return;
  // @ts-ignore
  realChannel.send(message.replace('[USER]', `<@${member.id}>`));
}
