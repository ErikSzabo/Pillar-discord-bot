import { Message } from 'discord.js';

import { PauseCommand } from './commands/PauseCommand';
import { PlayCommand } from './commands/PlayCommand';
import { QueueCommand } from './commands/QueueCommand';
import { ResumeCommand } from './commands/ResumeCommand';
import { SkipCommand } from './commands/SkipCommand';
import { StopCommand } from './commands/StopCommand';
import { VolumeCommand } from './commands/VolumeCommand';
import { CommandManager } from '../generic/ICommandManager';
import { MusicChannelCommand } from './commands/MusicChannelCommand';
import { IApplication } from '../application';

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
    this.addCommand(new MusicChannelCommand());
  }

  public handle(
    app: IApplication,
    command: string,
    args: Array<string>,
    message: Message
  ) {
    const { musicChannel } = app.getServerStore().get(message.guild.id);

    if (
      musicChannel !== 'off' &&
      musicChannel !== message.channel.id &&
      !message.member.permissions.has('ADMINISTRATOR')
    ) {
      message.delete();
      return;
    }
    if (this.commands.has(command)) {
      this.commands.get(command).execute(app, args, message);
    }
  }
}
