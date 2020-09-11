import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { musicCache } from '../MusicCache';
import { createEmbed, checkVoiceChannelMatch } from '../../utils';

export class PauseCommand extends Command {
  constructor() {
    super('pause', 'paueses the current musc');
  }

  public execute(args: Array<string>, message: Message): void {
    const voiceChannel = message.member.voice.channel;

    const serverData = musicCache.getServerData(message.guild.id);

    if (serverData && !serverData.isPlaying) {
      message.channel.send(
        createEmbed('Ooops', "There isn't any music to pause!", true)
      );
      return;
    }

    try {
      checkVoiceChannelMatch(message, voiceChannel);
    } catch (err) {
      message.channel.send(err.embed);
      return;
    }

    serverData.isPlaying = false;
    serverData.connection.dispatcher.pause();
    message.channel.send(
      createEmbed('⏸ Paused', `**${serverData.songs[0].title}** paused!`, false)
    );
  }
}
