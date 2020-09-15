import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { musicCache } from '../MusicCache';
import { checkVoiceChannelMatch } from '../../utils';
import { serverCache } from '../../generic/ServerCache';
import { language } from '../../language/LanguageManager';

export class SkipCommand extends Command {
  constructor() {
    super('skip', 'skip');
  }

  public execute(args: Array<string>, message: Message): void {
    const currLang = serverCache.getLang(message.guild.id);
    const voiceChannel = message.member.voice.channel;

    const serverData = musicCache.getServerData(message.guild.id);

    try {
      checkVoiceChannelMatch(message, voiceChannel, currLang);
    } catch (err) {
      message.channel.send(err.embed);
      return;
    }

    if (!serverData) {
      message.channel.send(language.get(currLang, 'noMusicToSkip'));
      return;
    }

    message.channel.send(
      language.get(currLang, 'musicSkipped', {
        song: serverData.songs[0].title,
      })
    );

    serverData.connection.dispatcher.end();
  }
}
