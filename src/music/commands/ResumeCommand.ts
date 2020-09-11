import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { musicCache } from '../MusicCache';
import { createEmbed, checkVoiceChannelMatch } from '../../utils';

export class ResumeCommand extends Command {
  constructor() {
    super('resume', 'resumes the paused music');
  }

  public execute(args: Array<string>, message: Message): void {
    const voiceChannel = message.member.voice.channel;

    const serverData = musicCache.getServerData(message.guild.id);

    if (serverData && serverData.isPlaying) {
      message.delete();
      return;
    }

    try {
      checkVoiceChannelMatch(message, voiceChannel);
    } catch (err) {
      message.channel.send(err.embed);
      return;
    }

    serverData.isPlaying = true;
    serverData.connection.dispatcher.resume();
    message.channel.send(
      createEmbed(
        '▶ Resumed',
        `**${serverData.songs[0].title}** has been resumed!`,
        false
      )
    );
  }
}
