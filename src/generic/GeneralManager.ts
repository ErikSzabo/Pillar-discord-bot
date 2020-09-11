import { CommandManager } from './ICommandManager';
import { HelpCommand } from './HelpCommand';
import { SetRoleCommand } from './SetRoleCommand';
import { Message } from 'discord.js';

/**
 * General command manager which controls the rest of the command managers
 * and has the generic/basic commands like help and some settings command.
 */
export class GeneralManager extends CommandManager {
  private commandManagers: Array<CommandManager>;

  constructor(name: string, ...commandManagers: Array<CommandManager>) {
    super(name);
    this.commandManagers = commandManagers;
    this.addCommand(new SetRoleCommand());
    this.addCommand(new HelpCommand([...commandManagers, this]));
  }

  public handle(command: string, args: Array<string>, message: Message): void {
    if (this.commands.has(command)) {
      this.commands.get(command).execute(args, message);
      return;
    }

    for (let manager of this.commandManagers) {
      if (manager.getCommandNames().includes(command)) {
        manager.handle(command, args, message);
        return;
      }
    }
  }
}
