import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { musicCache } from '../MusicCache';
import { checkVoiceChannelMatch } from '../../utils';
import { language } from '../../language/LanguageManager';

export class SkipCommand extends Command {
  constructor() {
    super('skip', 'skip');
  }

  public execute(args: Array<string>, message: Message): void {
    const serverID = message.guild.id;
    const voiceChannel = message.member.voice.channel;

    const serverData = musicCache.getServerData(message.guild.id);

    try {
      checkVoiceChannelMatch(message, voiceChannel, serverID);
    } catch (err) {
      message.channel.send(err.embed);
      return;
    }

    if (!serverData) {
      message.channel.send(language.get(serverID, 'noMusicToSkip'));
      return;
    }

    message.channel.send(
      language.get(serverID, 'musicSkipped', {
        song: serverData.songs[0].title,
      })
    );

    serverData.connection.dispatcher.end();
  }
}
