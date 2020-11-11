import { CommandManager } from './ICommandManager';
import { HelpCommand } from './HelpCommand';
import { SetRoleCommand } from './SetRoleCommand';
import { Message } from 'discord.js';
import { LanguageCommand } from './LanguageCommand';
import { TimezoneCommand } from './TimezoneCommand';
import { IApplication } from '../application';
import { PrefixCommand } from './PrefixCommand';

/**
 * General command manager which controls the rest of the command managers
 * and has the generic/basic commands like help and some settings command.
 */
export class GeneralManager extends CommandManager {
  private commandManagers: Array<CommandManager>;

  constructor(name: string, ...commandManagers: Array<CommandManager>) {
    super(name, '🌎');
    this.commandManagers = commandManagers;
  }

  public initialize(app: IApplication) {
    this.commandManagers.forEach((manager) => manager.initialize(app));
    this.addCommand(new SetRoleCommand(app));
    this.addCommand(new LanguageCommand(app));
    this.addCommand(new TimezoneCommand(app));
    this.addCommand(new PrefixCommand(app));
    this.addCommand(new HelpCommand(app, [...this.commandManagers, this]));
  }

  public handle(
    app: IApplication,
    command: string,
    args: Array<string>,
    message: Message
  ): void {
    if (this.commands.has(command)) {
      this.commands.get(command).execute(args, message);
      return;
    }

    for (let manager of this.commandManagers) {
      if (manager.getCommandNames().includes(command)) {
        manager.handle(app, command, args, message);
        return;
      }
    }
  }
}
