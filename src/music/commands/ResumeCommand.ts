import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { checkVoiceChannelMisMatch } from '../../utils';
import { musicAPI } from '../../apis/musicAPI';
import { IApplication } from '../../application';

export class ResumeCommand extends Command {
  constructor(app: IApplication) {
    super('resume', 'resume', app);
  }

  public execute(args: string[], message: Message) {
    const serverID = message.guild.id;
    const voiceChannel = message.member.voice.channel;

    if (checkVoiceChannelMisMatch(message, voiceChannel)) {
      message.channel.send(this.app.message(serverID, 'noVoiceChannelMatch'));
      return;
    }

    try {
      const song = musicAPI.resume(serverID);
      message.channel.send(
        this.app.message(serverID, 'musicResumed', { song })
      );
    } catch (err) {
      if (err.message === 'alreadyPlaying') message.delete();
    }
  }
}
