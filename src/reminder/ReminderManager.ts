import { scheduleJob, Job } from 'node-schedule';
import { CommandManager } from '../generic/ICommandManager';
import { AddCommand } from './commands/AddCommand';
import { DeleteCommand } from './commands/DeleteCommand';
import { Message } from 'discord.js';

// 1 week before
// 3 days before
// 3 hours before

export interface Reminder {
  serverID: string;
  mentionID: string;
  title: string;
  description: string;
  dates: Array<Date>;
}

export class ReminderManager extends CommandManager {
  private jobs: Map<string, Job>;

  constructor(name: string) {
    super(name);
    this.jobs = new Map<string, Job>();
    this.addCommand(new AddCommand(this.jobs));
    this.addCommand(new DeleteCommand(this.jobs));
  }

  public handle(command: string, args: Array<string>, message: Message): void {
    if (this.commands.has(command)) {
      this.commands.get(command).execute(args, message);
    }
  }
}
