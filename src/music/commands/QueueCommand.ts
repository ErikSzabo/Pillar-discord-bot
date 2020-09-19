import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { musicCache } from '../MusicCache';
import { language } from '../../language/LanguageManager';

export class QueueCommand extends Command {
  constructor() {
    super('queue', 'queue');
  }

  public execute(args: Array<string>, message: Message): void {
    const serverID = message.guild.id;
    const musicData = musicCache.get(serverID);

    if (!musicData) {
      message.channel.send(language.get(serverID, 'songQueueEmpty'));
      return;
    }

    message.channel.send(
      language.get(serverID, 'songQueue', {
        songs: musicData.songs.map((song) => `**-** ${song.title}`).join('\n'),
        song: musicData.songs[0].title,
      })
    );
  }
}
