import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { musicCache } from '../MusicCache';
import { checkVoiceChannelMatch } from '../../utils';
import { language } from '../../language/LanguageManager';

export class StopCommand extends Command {
  constructor() {
    super('stop', 'stop');
  }

  public execute(args: Array<string>, message: Message): void {
    const voiceChannel = message.member.voice.channel;
    const serverID = message.guild.id;
    const musicData = musicCache.get(serverID);

    try {
      checkVoiceChannelMatch(message, voiceChannel, serverID);
    } catch (err) {
      message.channel.send(err.embed);
      return;
    }

    if (!musicData) {
      message.channel.send(language.get(serverID, 'noMusicToStop'));
      return;
    }

    musicData.songs = [];
    musicData.connection.dispatcher.end();
    message.channel.send(language.get(serverID, 'musicStoppedCleared'));
  }
}
