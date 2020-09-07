import { MessageEmbed, Message, VoiceChannel, GuildMember } from 'discord.js';
import { CustomError } from './generic/CustomError';

interface VoiceMatchResult {
  error: boolean;
  message?: MessageEmbed;
}

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
  voiceChannel: VoiceChannel
): VoiceMatchResult {
  if (
    !voiceChannel ||
    !message.client.voice.connections.find(
      (conn) => conn.channel.id === voiceChannel.id
    )
  ) {
    const embed = createEmbed(
      'Ooops',
      "You are not listening with the bot, you can't use this command now!",
      true
    );

    return {
      error: true,
      message: embed,
    };
  }

  return {
    error: false,
  };
}

export function checkPermission(
  roleToCheck: string,
  member: GuildMember
): void {
  if (roleToCheck !== 'off' && !member.roles.cache.has(roleToCheck)) {
    throw new CustomError(
      createEmbed(
        '❌ No permission',
        "you don't have permission to use this command!",
        true
      )
    );
  }
}
