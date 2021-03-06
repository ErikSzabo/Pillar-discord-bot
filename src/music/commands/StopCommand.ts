import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { checkVoiceChannelMisMatch } from '../../utils';
import { musicAPI } from '../../apis/musicAPI';
import { IApplication } from '../../application';

export class StopCommand extends Command {
  constructor(app: IApplication) {
    super('stop', 'stop', app);
  }

  public execute(args: string[], message: Message) {
    const serverID = message.guild.id;
    const voiceChannel = message.member.voice.channel;

    if (checkVoiceChannelMisMatch(message, voiceChannel)) {
      message.channel.send(this.app.message(serverID, 'noVoiceChannelMatch'));
      return;
    }

    try {
      musicAPI.stop(serverID);
      message.channel.send(this.app.message(serverID, 'musicStoppedCleared'));
    } catch (err) {
      if (err.message === 'noMusicToStop')
        message.channel.send(this.app.message(serverID, err.message));
    }
  }
}
