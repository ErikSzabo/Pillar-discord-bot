import { Message } from 'discord.js';
import { Command } from '../../generic/Command';

export abstract class ReminderCommand extends Command {
  constructor(name: string, description: string) {
    super(name, description);
  }

  abstract execute(args: Array<string>, message: Message): void;
}
