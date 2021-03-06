import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { checkVoiceChannelMisMatch } from '../../utils';
import { musicAPI } from '../../apis/musicAPI';
import { IApplication } from '../../application';

export class SkipCommand extends Command {
  constructor(app: IApplication) {
    super('skip', 'skip', app);
  }

  public execute(args: string[], message: Message) {
    const serverID = message.guild.id;
    const voiceChannel = message.member.voice.channel;

    if (checkVoiceChannelMisMatch(message, voiceChannel)) {
      message.channel.send(this.app.message(serverID, 'noVoiceChannelMatch'));
      return;
    }

    try {
      const song = musicAPI.skip(serverID);
      message.channel.send(
        this.app.message(serverID, 'musicSkipped', { song })
      );
    } catch (err) {
      if (err.message === 'noMusicToSkip')
        message.channel.send(this.app.message(serverID, err.message));
    }
  }
}
