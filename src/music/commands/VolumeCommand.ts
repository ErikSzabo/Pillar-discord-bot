import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { checkVoiceChannelMatch } from '../../utils';
import { language } from '../../language/LanguageManager';
import { musicAPI } from '../../apis/music/musicAPI';

export class VolumeCommand extends Command {
  constructor() {
    super('volume', 'volume <number>');
  }

  public execute(args: Array<string>, message: Message): void {
    const voiceChannel = message.member.voice.channel;
    const serverID = message.guild.id;
    const errors = ['cantChangeVolume', 'notNumberVolume'];

    try {
      checkVoiceChannelMatch(message, voiceChannel, serverID);
    } catch (err) {
      message.channel.send(err.embed);
      return;
    }

    if (!args[0]) {
      const volume = musicAPI.getVolume(serverID);
      if (volume) {
        message.channel.send(
          language.get(serverID, 'currentVolume', { volume })
        );
      } else {
        message.channel.send(language.get(serverID, 'cantChangeVolume'));
      }
      return;
    }

    try {
      const volume = musicAPI.volume(serverID, args[0]);
      message.channel.send(language.get(serverID, 'volumeSet', { volume }));
    } catch (err) {
      if (errors.includes(err.message))
        message.channel.send(language.get(serverID, err.message));
    }
  }
}
