import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { musicCache } from '../MusicCache';
import { checkVoiceChannelMatch } from '../../utils';
import { language } from '../../language/LanguageManager';

export class VolumeCommand extends Command {
  constructor() {
    super('volume', 'volume <number>');
  }

  public execute(args: Array<string>, message: Message): void {
    const voiceChannel = message.member.voice.channel;
    const serverID = message.guild.id;
    const serverData = musicCache.getServerData(serverID);

    try {
      checkVoiceChannelMatch(message, voiceChannel, serverID);
    } catch (err) {
      message.channel.send(err.embed);
      return;
    }

    if (!serverData) {
      message.channel.send(language.get(serverID, 'cantChangeVolume'));
      return;
    }

    if (!args[0]) {
      message.channel.send(
        language.get(serverID, 'currentVolume', { volume: serverData.volume })
      );
      return;
    }

    const volume = parseInt(args[0]);
    if (isNaN(volume)) {
      message.channel.send(language.get(serverID, 'notNumberVolume'));
      return;
    }
    serverData.volume = volume;
    serverData.connection.dispatcher.setVolumeLogarithmic(volume / 5);
    message.channel.send(language.get(serverID, 'volumeSet', { volume }));
  }
}
