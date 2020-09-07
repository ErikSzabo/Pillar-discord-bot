import { Command } from './Command';
import { Message } from 'discord.js';
import { createEmbed } from '../utils';
import config from '../config';
import { CommandManager } from './ICommandManager';

export class HelpCommand extends Command {
  private commandManagers: Array<CommandManager>;

  constructor(commandManagers: Array<CommandManager>) {
    super('help', 'displays this help page');
    this.commandManagers = commandManagers;
  }

  public execute(args: Array<string>, message: Message) {
    message.channel.send(createEmbed('⁉ Help', this.createHelpPage(), false));
  }

  private create(cmd: Command): string {
    return `- **${
      config.prefix
    }${cmd.getName()}** -- ${cmd.getDescription()}\n`;
  }

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
