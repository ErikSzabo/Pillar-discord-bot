import { Message } from 'discord.js';
import { Job } from 'node-schedule';
import { ReminderCommand } from './ReminderCommand';
import { createEmbed, checkPermission } from '../../utils';
import { reminders } from '../../database';
import { generalServerCache } from '../../generic/GeneralServerCache';

export class DeleteCommand extends ReminderCommand {
  constructor(jobs: Map<string, Job>) {
    super('r-delete', 'deletes a reminder', jobs);
  }

  public execute(args: Array<string>, message: Message): void {
    const modRole = generalServerCache.getModerationRole(message.guild.id);
    try {
      checkPermission(modRole, message.member);
    } catch (error) {
      message.channel.send(error.embed);
      return;
    }
  }
}
