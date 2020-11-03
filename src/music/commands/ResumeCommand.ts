import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { checkVoiceChannelMisMatch } from '../../utils';
import { musicAPI } from '../../apis/musicAPI';
import { IApplication } from '../../application';

export class ResumeCommand extends Command {
  constructor() {
    super('resume', 'resume');
  }

  public execute(app: IApplication, args: string[], message: Message) {
    const serverID = message.guild.id;
    const voiceChannel = message.member.voice.channel;

    if (checkVoiceChannelMisMatch(message, voiceChannel)) {
      message.channel.send(app.message(serverID, 'noVoiceChannelMatch'));
      return;
    }

    try {
      const song = musicAPI.resume(serverID);
      message.channel.send(app.message(serverID, 'musicResumed', { song }));
    } catch (err) {
      if (err.message === 'alreadyPlaying') message.delete();
    }
  }
}
