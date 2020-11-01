import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { checkVoiceChannelMatch } from '../../utils';
import { language } from '../../language/LanguageManager';
import { musicAPI } from '../../apis/music/musicAPI';

export class ResumeCommand extends Command {
  constructor() {
    super('resume', 'resume');
  }

  public execute(args: Array<string>, message: Message): void {
    const serverID = message.guild.id;
    const voiceChannel = message.member.voice.channel;

    try {
      checkVoiceChannelMatch(message, voiceChannel, serverID);
      const song = musicAPI.resume(serverID);
      message.channel.send(language.get(serverID, 'musicResumed', { song }));
    } catch (err) {
      if (err.message === 'alreadyPlaying') message.delete();
      if (err.embed) message.channel.send(err.embed);
    }
  }
}
