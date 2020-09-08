import { Message } from 'discord.js';
import { Job } from 'node-schedule';
import { ReminderCommand } from './ReminderCommand';
import { createEmbed } from '../../utils';
import { reminders } from '../../database';

export class DeleteCommand extends ReminderCommand {
  constructor() {
    super('r-delete', 'deletes a reminder');
  }

  public execute(args: Array<string>, message: Message): void {}
}
