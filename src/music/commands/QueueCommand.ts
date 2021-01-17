import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { musicAPI } from '../../apis/musicAPI';
import { IApplication } from '../../application';

export class QueueCommand extends Command {
  constructor(app: IApplication) {
    super('queue', 'queue', app);
  }

  public execute(args: string[], message: Message) {
    const serverID = message.guild.id;

    if (!musicAPI.hasQueue(serverID)) {
      message.channel.send(this.app.message(serverID, 'songQueueEmpty'));
      return;
    }

    const queue = musicAPI.getQueue(serverID);

    message.channel.send(
      this.app.message(serverID, 'songQueue', {
        songs: `\`\`\`${queue.map((song) => song.title).join('\n')}\`\`\``,
        song: `[${queue[0].title}](${queue[0].url})`,
        prefix: this.app.getServerStore().get(serverID).prefix,
      })
    );
  }
}
