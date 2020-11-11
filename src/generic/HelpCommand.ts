import { Command } from './Command';
import { Message } from 'discord.js';
import { createEmbed } from '../utils';
import { CommandManager } from './ICommandManager';
import { IApplication } from '../application';

/**
 * Help command which will create a help page from all of the commands.
 */
export class HelpCommand extends Command {
  private commandManagers: Array<CommandManager>;

  constructor(app: IApplication, commandManagers: CommandManager[]) {
    super('help', 'help', app);
    this.commandManagers = commandManagers;
  }

  public execute(args: string[], message: Message) {
    const serverID = message.guild.id;
    message.channel.send(
      createEmbed('⁉ Help', this.createHelpPage(serverID), false)
    );
  }

  /**
   * Helper function for createHelpPage.
   * Creates a formatted string for a command.
   *
   * @param cmd      command
   * @param serverID the id of a server
   */
  private create(cmd: Command, serverID: string): string {
    return `- **${
      this.app.getServerStore().get(serverID).prefix
    }${cmd.getUsage()}** -- ${cmd.getDescription(
      this.app,
      this.app.getServerStore().get(serverID).language
    )}\n`;
  }

  /**
   * Creates a long, formatted string from the command managers' commands.
   *
   * @param serverID the id of a server
   */
  private createHelpPage(serverID: string): string {
    return this.commandManagers
      .map((manager) => {
        let managerString = `✅ __**${manager.getName()}**__\n`;
        manager
          .getCommands()
          .forEach(
            (command) => (managerString += this.create(command, serverID))
          );
        return managerString;
      })
      .join('\n');
  }
}
