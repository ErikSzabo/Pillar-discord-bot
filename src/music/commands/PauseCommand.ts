import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { checkVoiceChannelMatch } from '../../utils';
import { language } from '../../language/LanguageManager';
import { musicAPI } from '../../apis/music/musicAPI';

export class PauseCommand extends Command {
  constructor() {
    super('pause', 'pause');
  }

  public execute(args: Array<string>, message: Message): void {
    const voiceChannel = message.member.voice.channel;
    const serverID = message.guild.id;

    try {
      checkVoiceChannelMatch(message, voiceChannel, serverID);
      const song = musicAPI.pause(serverID);
      message.channel.send(language.get(serverID, 'musicPaused', { song }));
    } catch (err) {
      if (err.message === 'nothingToPause')
        message.channel.send(language.get(serverID, 'nothingToPause'));
      if (err.embed) message.channel.send(err.embed);
    }
  }
}
