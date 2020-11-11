import { Command } from './Command';
import { Message } from 'discord.js';
import { createEmbed } from '../utils';
import { CommandManager } from './ICommandManager';
import { IApplication } from '../application';

export class HelpCommand extends Command {
  private commandManagers: Array<CommandManager>;

  constructor(app: IApplication, commandManagers: CommandManager[]) {
    super('help', 'help', app);
    this.commandManagers = commandManagers;
  }

  public execute(args: string[], message: Message) {
    const serverID = message.guild.id;

    if (!args[0]) {
      message.channel.send(
        createEmbed('Help', this.managerHelpPage(serverID), false)
      );
      return;
    }

    for (let manager of this.commandManagers) {
      if (manager.getName().toLowerCase() == args[0]) {
        message.channel.send(
          createEmbed(
            `${manager.getIcon()}  ${manager.getName()}`,
            this.specificHelpPage(manager, serverID),
            false
          )
        );
        return;
      }
    }

    message.channel.send(this.app.message(serverID, 'invalid'));
  }

  private create(cmd: Command, serverID: string): string {
    return `- **${
      this.app.getServerStore().get(serverID).prefix
    }${cmd.getUsage()}** -- ${cmd.getDescription(
      this.app,
      this.app.getServerStore().get(serverID).language
    )}\n`;
  }

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

  private managerHelpPage(serverID: string) {
    return this.commandManagers
      .map(
        (manager) =>
          `${manager.getIcon()}  ${
            this.app.getServerStore().get(serverID).prefix
          }help **${manager.getName().toLowerCase()}**`
      )
      .join('\n\n');
  }

  private specificHelpPage(manager: CommandManager, serverID: string): string {
    return manager
      .getCommands()
      .map((cmd) => {
        return `- **${
          this.app.getServerStore().get(serverID).prefix
        }${cmd.getUsage()}** -- ${cmd.getDescription(
          this.app,
          this.app.getServerStore().get(serverID).language
        )}`;
      })
      .join('\n');
  }
}
