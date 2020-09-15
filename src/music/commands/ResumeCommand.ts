import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { musicCache } from '../MusicCache';
import { checkVoiceChannelMatch } from '../../utils';
import { serverCache } from '../../generic/ServerCache';
import { language } from '../../language/LanguageManager';

export class ResumeCommand extends Command {
  constructor() {
    super('resume', 'resume');
  }

  public execute(args: Array<string>, message: Message): void {
    const currLang = serverCache.getLang(message.guild.id);
    const voiceChannel = message.member.voice.channel;

    const serverData = musicCache.getServerData(message.guild.id);

    if (serverData && serverData.isPlaying) {
      message.delete();
      return;
    }

    try {
      checkVoiceChannelMatch(message, voiceChannel, currLang);
    } catch (err) {
      message.channel.send(err.embed);
      return;
    }

    serverData.isPlaying = true;
    serverData.connection.dispatcher.resume();
    message.channel.send(
      language.get(currLang, 'musicResumed', {
        song: serverData.songs[0].title,
      })
    );
  }
}
