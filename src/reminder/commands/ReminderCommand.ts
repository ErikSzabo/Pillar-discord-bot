import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { Job } from 'node-schedule';

export abstract class ReminderCommand extends Command {
  protected jobs: Map<string, Job>;

  constructor(name: string, description: string, jobs: Map<string, Job>) {
    super(name, description);
    this.jobs = jobs;
  }

  abstract execute(args: Array<string>, message: Message): void;
}
