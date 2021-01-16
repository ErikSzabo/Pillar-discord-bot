import { Message } from 'discord.js';
import { parseQuotedArgs } from '../../utils';
import { Command } from '../../generic/Command';
import { logger } from '../../logger';
import { IApplication } from '../../application';

export class DeleteCommand extends Command {
  constructor(app: IApplication) {
    super('r-delete', 'r-delete "name"', app);
  }

  public async execute(args: string[], message: Message) {
    const serverID = message.guild.id;
    let title: string;

    try {
      title = this.parseReminderName(message);
    } catch (err) {
      message.channel.send(this.app.message(serverID, err.message));
      return;
    }

    const reminder = this.app.getReminderStore().get(serverID, { title });
    if (reminder) {
      try {
        await this.app.getReminderStore().delete(serverID, { title });
        this.app.getScheduler().terminateReminder(reminder);
        message.channel.send(
          this.app.message(serverID, 'reminderDeleted', { reminder: title })
        );
      } catch (error) {
        console.log(error);
        message.channel.send(this.app.message(serverID, 'botError'));
        logger.error(error.message);
      }
    } else {
      message.channel.send(
        this.app.message(serverID, 'reminderNotFound', { reminder: title })
      );
      return;
    }
  }

  private parseReminderName(message: Message): string {
    const msg = parseQuotedArgs(message, this.getName());

    if (msg.length < 1) throw new Error('notEnoughArguments');

    return msg[0];
  }
}
