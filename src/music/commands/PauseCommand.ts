import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { checkVoiceChannelMisMatch } from '../../utils';
import { musicAPI } from '../../apis/musicAPI';
import { IApplication } from '../../application';

export class PauseCommand extends Command {
  constructor() {
    super('pause', 'pause');
  }

  public execute(app: IApplication, args: string[], message: Message) {
    const voiceChannel = message.member.voice.channel;
    const serverID = message.guild.id;

    if (checkVoiceChannelMisMatch(message, voiceChannel)) {
      message.channel.send(app.message(serverID, 'noVoiceChannelMatch'));
      return;
    }

    try {
      const song = musicAPI.pause(serverID);
      message.channel.send(app.message(serverID, 'musicPaused', { song }));
    } catch (err) {
      if (err.message === 'nothingToPause')
        message.channel.send(app.message(serverID, 'nothingToPause'));
    }
  }
}
