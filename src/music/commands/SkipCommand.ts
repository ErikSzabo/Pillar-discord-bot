import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { checkVoiceChannelMatch } from '../../utils';
import { language } from '../../language/LanguageManager';
import { musicAPI } from '../../apis/music/musicAPI';

export class SkipCommand extends Command {
  constructor() {
    super('skip', 'skip');
  }

  public execute(args: Array<string>, message: Message): void {
    const serverID = message.guild.id;
    const voiceChannel = message.member.voice.channel;

    try {
      checkVoiceChannelMatch(message, voiceChannel, serverID);
      const song = musicAPI.skip(serverID);
      message.channel.send(language.get(serverID, 'musicSkipped', { song }));
    } catch (err) {
      if (err.embed) message.channel.send(err.embed);
      if (err.message === 'noMusicToSkip')
        message.channel.send(language.get(serverID, err.message));
    }
  }
}
