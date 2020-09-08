import { Message } from 'discord.js';
import { Job } from 'node-schedule';
import { ReminderCommand } from './ReminderCommand';
import { createEmbed } from '../../utils';

export class AddCommand extends ReminderCommand {
  constructor(jobs: Map<string, Job>) {
    super(
      'r-add',
      'adds a new reminder, <name> <mention> <date> [description]',
      jobs
    );
  }

  public execute(args: Array<string>, message: Message): void {}
}
