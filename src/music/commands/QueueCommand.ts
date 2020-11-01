import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { language } from '../../language/LanguageManager';
import { musicAPI } from '../../apis/music/musicAPI';

export class QueueCommand extends Command {
  constructor() {
    super('queue', 'queue');
  }

  public execute(args: Array<string>, message: Message): void {
    const serverID = message.guild.id;

    if (!musicAPI.hasQueue(serverID)) {
      message.channel.send(language.get(serverID, 'songQueueEmpty'));
      return;
    }

    const queue = musicAPI.getQueue(serverID);

    message.channel.send(
      language.get(serverID, 'songQueue', {
        songs: queue.map((song) => `**-** ${song.title}`).join('\n'),
        song: queue[0].title,
      })
    );
  }
}
