import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { musicCache } from '../MusicCache';
import { checkVoiceChannelMatch } from '../../utils';
import { language } from '../../language/LanguageManager';

export class ResumeCommand extends Command {
  constructor() {
    super('resume', 'resume');
  }

  public execute(args: Array<string>, message: Message): void {
    const serverID = message.guild.id;
    const voiceChannel = message.member.voice.channel;

    const musicData = musicCache.get(serverID);

    if (musicData && musicData.isPlaying) {
      message.delete();
      return;
    }

    try {
      checkVoiceChannelMatch(message, voiceChannel, serverID);
    } catch (err) {
      message.channel.send(err.embed);
      return;
    }

    musicData.isPlaying = true;
    musicData.connection.dispatcher.resume();
    message.channel.send(
      language.get(serverID, 'musicResumed', {
        song: musicData.songs[0].title,
      })
    );
  }
}
