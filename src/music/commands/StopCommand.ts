import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { musicCache } from '../MusicCache';
import { checkVoiceChannelMatch } from '../../utils';
import { serverCache } from '../../generic/ServerCache';
import { language } from '../../language/LanguageManager';

export class StopCommand extends Command {
  constructor() {
    super('stop', 'stop');
  }

  public execute(args: Array<string>, message: Message): void {
    const voiceChannel = message.member.voice.channel;
    const currLang = serverCache.getLang(message.guild.id);
    const serverData = musicCache.getServerData(message.guild.id);

    try {
      checkVoiceChannelMatch(message, voiceChannel, currLang);
    } catch (err) {
      message.channel.send(err.embed);
      return;
    }

    if (!serverData) {
      message.channel.send(language.get(currLang, 'noMusicToStop'));
      return;
    }

    serverData.songs = [];
    serverData.connection.dispatcher.end();
    message.channel.send(language.get(currLang, 'musicStoppedCleared'));
  }
}
