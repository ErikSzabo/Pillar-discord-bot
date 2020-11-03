import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { checkVoiceChannelMisMatch } from '../../utils';
import { musicAPI } from '../../apis/musicAPI';
import { IApplication } from '../../application';

export class VolumeCommand extends Command {
  constructor() {
    super('volume', 'volume <number>');
  }

  public execute(app: IApplication, args: string[], message: Message) {
    const voiceChannel = message.member.voice.channel;
    const serverID = message.guild.id;
    const errors = ['cantChangeVolume', 'notNumberVolume'];

    if (checkVoiceChannelMisMatch(message, voiceChannel)) {
      message.channel.send(app.message(serverID, 'noVoiceChannelMatch'));
      return;
    }

    if (!args[0]) {
      const volume = musicAPI.getVolume(serverID);
      if (volume) {
        message.channel.send(
          app.message(serverID, 'currentVolume', { volume })
        );
      } else {
        message.channel.send(app.message(serverID, 'cantChangeVolume'));
      }
      return;
    }

    try {
      const volume = musicAPI.volume(serverID, args[0]);
      message.channel.send(app.message(serverID, 'volumeSet', { volume }));
    } catch (err) {
      if (errors.includes(err.message))
        message.channel.send(app.message(serverID, err.message));
    }
  }
}
