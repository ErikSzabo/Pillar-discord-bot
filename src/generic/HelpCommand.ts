import { Command } from './Command';
import { Message } from 'discord.js';
import { createEmbed } from '../utils';
import config from '../config';
import { CommandManager } from './ICommandManager';

/**
 * Help command which will create a help page from all of the commands.
 */
export class HelpCommand extends Command {
  private commandManagers: Array<CommandManager>;

  constructor(commandManagers: Array<CommandManager>) {
    super('help', 'help', 'displays this help page');
    this.commandManagers = commandManagers;
  }

  /**
   * @see Command
   */
  public execute(args: Array<string>, message: Message) {
    message.channel.send(createEmbed('⁉ Help', this.createHelpPage(), false));
  }

  /**
   * Helper function for createHelpPage.
   * Creates a formatted string for a command.
   *
   * @param cmd command
   */
  private create(cmd: Command): string {
    return `- **${
      config.prefix
    }${cmd.getUsage()}** -- ${cmd.getDescription()}\n`;
  }

  /**
   * Creates a long, formatted string from the command managers' commands.
   */
  private createHelpPage(): string {
    return this.commandManagers
      .map((manager) => {
        let managerString = `✅ __**${manager.getName()}**__\n`;
        manager
          .getCommands()
          .forEach((command) => (managerString += this.create(command)));
        return managerString;
      })
      .join('\n');
  }
}
