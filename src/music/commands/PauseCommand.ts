import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { musicCache } from '../MusicCache';
import { checkVoiceChannelMatch } from '../../utils';
import { serverCache } from '../../generic/ServerCache';
import { language } from '../../language/LanguageManager';

export class PauseCommand extends Command {
  constructor() {
    super('pause', 'pause', 'paueses the current musc');
  }

  public execute(args: Array<string>, message: Message): void {
    const voiceChannel = message.member.voice.channel;
    const currLang = serverCache.getLang(message.guild.id);
    const serverData = musicCache.getServerData(message.guild.id);

    if (serverData && !serverData.isPlaying) {
      message.channel.send(language.get(currLang, 'nothingToPause'));
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
      language.get(currLang, 'musicPaused', {
        song: musicCache.getServerData(message.guild.id).songs[0].title,
      })
    );
  }
}
