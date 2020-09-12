import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { musicCache } from '../MusicCache';
import { createEmbed, checkVoiceChannelMatch } from '../../utils';

export class SkipCommand extends Command {
  constructor() {
    super('skip', 'skip', 'skips the current music');
  }

  public execute(args: Array<string>, message: Message): void {
    const voiceChannel = message.member.voice.channel;

    const serverData = musicCache.getServerData(message.guild.id);

    try {
      checkVoiceChannelMatch(message, voiceChannel);
    } catch (err) {
      message.channel.send(err.embed);
      return;
    }

    if (!serverData) {
      message.channel.send(
        createEmbed(
          'Ooops',
          'There is nothing playing that I could skip for you.',
          true
        )
      );
      return;
    }

    message.channel.send(
      createEmbed(
        '▶ Skipped',
        `**${serverData.songs[0].title}** is skipped for you 🤪`,
        false
      )
    );

    serverData.connection.dispatcher.end();
  }
}
