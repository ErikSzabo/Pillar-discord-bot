import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { ServerCache } from '../ServerCache';
import { createEmbed, checkVoiceChannelMatch } from '../../utils';

export class StopCommand extends Command {
  constructor() {
    super('stop', 'stops the music and clears the queue');
  }

  public execute(args: Array<string>, message: Message): void {
    const voiceChannel = message.member.voice.channel;

    const serverData = ServerCache.getInstance().getServerData(
      message.guild.id
    );

    const voiceResult = checkVoiceChannelMatch(message, voiceChannel);
    if (voiceResult.error) {
      message.channel.send(voiceResult.message);
      return;
    }

    if (!serverData) {
      message.channel.send(
        createEmbed(
          'Ooops',
          'There is nothing playing that I could stop for you.',
          true
        )
      );
      return;
    }

    serverData.songs = [];
    serverData.connection.dispatcher.end();
    message.channel.send(
      createEmbed('🧐 Cleared', 'Music stopped, queue emptied!', false)
    );
  }
}
