import { MessageEmbed, Message, VoiceChannel } from 'discord.js';
import { config } from './config';

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

export function checkVoiceChannelMisMatch(
  message: Message,
  voiceChannel: VoiceChannel
): boolean {
  return (
    !voiceChannel ||
    !message.client.voice.connections.find(
      (conn) => conn.channel.id === voiceChannel.id
    )
  );
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

export function objectEqual<T>(obj1: T, obj2: T) {
  for (let key in obj1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  return true;
}
