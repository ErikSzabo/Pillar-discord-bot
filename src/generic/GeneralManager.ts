import { CommandManager } from './ICommandManager';
import { HelpCommand } from './HelpCommand';
import { MusicChannelCommand } from './MusicChannelCommand';
import { SetRoleCommand } from './SetRoleCommand';
import { Message } from 'discord.js';

export class GeneralManager extends CommandManager {
  constructor(name: string, ...commandManagers: Array<CommandManager>) {
    super(name);
    commandManagers.push(this);
    this.addCommand(new MusicChannelCommand());
    this.addCommand(new SetRoleCommand());
    this.addCommand(new HelpCommand(commandManagers));
  }

  public handle(command: string, args: Array<string>, message: Message): void {
    if (this.commands.has(command)) {
      this.commands.get(command).execute(args, message);
    }
  }
}
