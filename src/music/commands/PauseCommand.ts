import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { musicCache } from '../MusicCache';
import { checkVoiceChannelMatch } from '../../utils';
import { language } from '../../language/LanguageManager';

export class PauseCommand extends Command {
  constructor() {
    super('pause', 'pause');
  }

  public execute(args: Array<string>, message: Message): void {
    const voiceChannel = message.member.voice.channel;
    const serverID = message.guild.id;
    const serverData = musicCache.getServerData(message.guild.id);

    if (serverData && !serverData.isPlaying) {
      message.channel.send(language.get(serverID, 'nothingToPause'));
      return;
    }

    try {
      checkVoiceChannelMatch(message, voiceChannel, serverID);
    } catch (err) {
      message.channel.send(err.embed);
      return;
    }

    serverData.isPlaying = false;
    serverData.connection.dispatcher.pause();
    message.channel.send(
      language.get(serverID, 'musicPaused', {
        song: musicCache.getServerData(serverID).songs[0].title,
      })
    );
  }
}
