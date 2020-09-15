import { Command } from './Command';
import { Message } from 'discord.js';
import { createEmbed } from '../utils';
import config from '../config';
import { CommandManager } from './ICommandManager';
import { serverCache } from './ServerCache';

/**
 * Help command which will create a help page from all of the commands.
 */
export class HelpCommand extends Command {
  private commandManagers: Array<CommandManager>;

  constructor(commandManagers: Array<CommandManager>) {
    super('help', 'help');
    this.commandManagers = commandManagers;
  }

  /**
   * @see Command
   */
  public execute(args: Array<string>, message: Message) {
    const currLang = serverCache.getLang(message.guild.id);
    message.channel.send(
      createEmbed('⁉ Help', this.createHelpPage(currLang), false)
    );
  }

  /**
   * Helper function for createHelpPage.
   * Creates a formatted string for a command.
   *
   * @param cmd      command
   * @param currLang prefferred language for the server
   */
  private create(cmd: Command, currLang: string): string {
    return `- **${config.prefix}${cmd.getUsage()}** -- ${cmd.getDescription(
      currLang
    )}\n`;
  }

  /**
   * Creates a long, formatted string from the command managers' commands.
   *
   * @param currLang prefferred language for the server
   */
  private createHelpPage(currLang: string): string {
    return this.commandManagers
      .map((manager) => {
        let managerString = `✅ __**${manager.getName()}**__\n`;
        manager
          .getCommands()
          .forEach(
            (command) => (managerString += this.create(command, currLang))
          );
        return managerString;
      })
      .join('\n');
  }
}
