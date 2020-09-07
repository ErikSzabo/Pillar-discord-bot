import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { ServerCache } from '../ServerCache';
import { createEmbed } from '../../utils';

export class QueueCommand extends Command {
  constructor() {
    super('queue', 'shows the music queue');
  }

  public execute(args: Array<string>, message: Message): void {
    const serverData = ServerCache.getInstance().getServerData(
      message.guild.id
    );

    if (!serverData) {
      message.channel.send(
        createEmbed('Empty!', "There isn't anything in the queue!", false)
      );
      return;
    }

    message.channel.send(
      createEmbed(
        'Song queue:',
        `${serverData.songs
          .map((song) => `**-** ${song.title}`)
          .join('\n')} \n**Now playing**: ${serverData.songs[0].title}`,
        false
      )
    );
  }
}
