import { Message } from 'discord.js';

import { PauseCommand } from './commands/PauseCommand';
import { PlayCommand } from './commands/PlayCommand';
import { QueueCommand } from './commands/QueueCommand';
import { ResumeCommand } from './commands/ResumeCommand';
import { SkipCommand } from './commands/SkipCommand';
import { StopCommand } from './commands/StopCommand';
import { VolumeCommand } from './commands/VolumeCommand';
import { CommandManager } from '../generic/ICommandManager';
import { generalServerCache } from '../generic/GeneralServerCache';

export class MusicManager extends CommandManager {
  constructor(name: string) {
    super(name);
    this.addCommand(new PauseCommand());
    this.addCommand(new PlayCommand());
    this.addCommand(new QueueCommand());
    this.addCommand(new ResumeCommand());
    this.addCommand(new SkipCommand());
    this.addCommand(new StopCommand());
    this.addCommand(new VolumeCommand());
  }

  public handle(command: string, args: Array<string>, message: Message) {
    const musicChannel = generalServerCache.getMusicChannel(message.guild.id);
    if (musicChannel !== 'off' && musicChannel !== message.channel.id) {
      message.delete();
      return;
    }
    if (this.commands.has(command)) {
      this.commands.get(command).execute(args, message);
    }
  }
}
