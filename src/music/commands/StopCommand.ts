import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { checkVoiceChannelMatch } from '../../utils';
import { language } from '../../language/LanguageManager';
import { musicAPI } from '../../apis/music/musicAPI';

export class StopCommand extends Command {
  constructor() {
    super('stop', 'stop');
  }

  public execute(args: Array<string>, message: Message): void {
    const voiceChannel = message.member.voice.channel;
    const serverID = message.guild.id;

    try {
      checkVoiceChannelMatch(message, voiceChannel, serverID);
      musicAPI.stop(serverID);
      message.channel.send(language.get(serverID, 'musicStoppedCleared'));
    } catch (err) {
      if (err.embed) message.channel.send(err.embed);
      if (err.message === 'noMusicToStop')
        message.channel.send(language.get(serverID, err.message));
    }
  }
}
