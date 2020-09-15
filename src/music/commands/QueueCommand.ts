import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { musicCache } from '../MusicCache';
import { serverCache } from '../../generic/ServerCache';
import { language } from '../../language/LanguageManager';

export class QueueCommand extends Command {
  constructor() {
    super('queue', 'queue', 'shows the music queue');
  }

  public execute(args: Array<string>, message: Message): void {
    const currLang = serverCache.getLang(message.guild.id);
    const serverData = musicCache.getServerData(message.guild.id);

    if (!serverData) {
      message.channel.send(language.get(currLang, 'songQueueEmpty'));
      return;
    }

    message.channel.send(
      language.get(currLang, 'songQueue', {
        songs: serverData.songs.map((song) => `**-** ${song.title}`).join('\n'),
        song: serverData.songs[0].title,
      })
    );
  }
}
