import { Message } from 'discord.js';
import { Job } from 'node-schedule';
import { ReminderCommand } from './ReminderCommand';
import { createEmbed, checkPermission } from '../../utils';
import { generalServerCache } from '../../generic/GeneralServerCache';

export class AddCommand extends ReminderCommand {
  constructor(jobs: Map<string, Job>) {
    super(
      'r-add',
      'adds a new reminder, <name> <mention> <date> [description]',
      jobs
    );
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
