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
    const serverData = musicCache.getServerData(message.guild.id);

    if (!serverData) {
      message.channel.send(language.get(serverID, 'songQueueEmpty'));
      return;
    }

    message.channel.send(
      language.get(serverID, 'songQueue', {
        songs: serverData.songs.map((song) => `**-** ${song.title}`).join('\n'),
        song: serverData.songs[0].title,
      })
    );
  }
}
