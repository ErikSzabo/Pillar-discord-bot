import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { musicCache } from '../MusicCache';
import { createEmbed, checkVoiceChannelMatch } from '../../utils';

export class StopCommand extends Command {
  constructor() {
    super('stop', 'stop', 'stops the music and clears the queue');
  }

  public execute(args: Array<string>, message: Message): void {
    const voiceChannel = message.member.voice.channel;

    const serverData = musicCache.getServerData(message.guild.id);

    try {
      checkVoiceChannelMatch(message, voiceChannel);
    } catch (err) {
      message.channel.send(err.embed);
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
