import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { musicCache } from '../MusicCache';
import { createEmbed, checkVoiceChannelMatch } from '../../utils';

export class VolumeCommand extends Command {
  constructor() {
    super('volume', 'volume <number>', 'sets or displays the volume');
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
        createEmbed('Ooops', 'There is nothing playing.', true)
      );
      return;
    }

    if (!args[0]) {
      message.channel.send(
        createEmbed(
          '🔊 Volume',
          `The current volume is: **${serverData.volume}**`,
          false
        )
      );
      return;
    }

    const volume = parseInt(args[0]);
    if (isNaN(volume)) {
      message.channel.send(
        createEmbed(
          '🔊 Volume',
          'You have to provide a valid number as the volume!',
          true
        )
      );
      return;
    }
    serverData.volume = volume;
    serverData.connection.dispatcher.setVolumeLogarithmic(volume / 5);
    message.channel.send(
      createEmbed('🔊 Volume', `Volume set to: **${args[0]}**`, false)
    );
  }
}
