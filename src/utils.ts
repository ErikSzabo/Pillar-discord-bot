import {
  MessageEmbed,
  Message,
  VoiceChannel,
  GuildMember,
  PartialGuildMember,
} from 'discord.js';
import { CustomError } from './generic/CustomError';
import config from './config';
import { language } from './language/LanguageManager';
import { ServerInfo } from './generic/ServerInfo';
import { serverCache } from './generic/ServerCache';

export function createEmbed(
  title: string,
  description: string,
  isWarning: boolean
): MessageEmbed {
  const embedMessage = new MessageEmbed();
  embedMessage.setTitle(title);
  embedMessage.setDescription(description);
  embedMessage.setColor(isWarning ? '#FF0000' : '#0099ff');
  return embedMessage;
}

export function checkVoiceChannelMatch(
  message: Message,
  voiceChannel: VoiceChannel,
  serverID: string
): void {
  if (
    !voiceChannel ||
    !message.client.voice.connections.find(
      (conn) => conn.channel.id === voiceChannel.id
    )
  ) {
    throw new CustomError(language.get(serverID, 'noVoiceChannelMatch'));
  }
}

export function checkPermission(
  roleToCheck: string,
  member: GuildMember,
  serverID: string
): void {
  if (member.permissions.has('ADMINISTRATOR')) return;
  if (roleToCheck !== 'off' && !member.roles.cache.has(roleToCheck)) {
    throw new CustomError(language.get(serverID, 'noUserPerm'));
  }
}

export function parseQuotedArgs(
  message: Message,
  commandName: string
): Array<string> {
  return message.content
    .slice(config.prefix.length + commandName.length)
    .trim()
    .split(/('.*?'|".*?"|\S+)/g)
    .map((el) => el.trim().replace(/"/g, ''))
    .filter((el) => el !== '');
}

export function createServerConstruct(serverID: string): ServerInfo {
  return {
    serverID: serverID,
    musicChannel: 'off',
    moderationRole: 'off',
    pollRole: 'off',
    welcomeChannel: 'off',
    welcomeMessage: '[USER] joined the server!',
    leaveMessage: '[USER] leaved the server!',
    language: 'en',
    timezone: 'UTC',
  };
}

export function handleWelcomeLeaveMessage(
  messageType: 'leaveMessage' | 'welcomeMessage',
  member: GuildMember | PartialGuildMember
): void {
  const serverData = serverCache.get(member.guild.id);
  const welcomeChannel = serverData.welcomeChannel;
  const message = serverData[messageType];

  if (welcomeChannel === 'off' || message === 'off') return;

  let realChannel = member.guild.channels.cache.get(welcomeChannel);
  if (realChannel.type !== 'text') return;
  // @ts-ignore
  realChannel.send(message.replace('[USER]', `<@${member.id}>`));
}
