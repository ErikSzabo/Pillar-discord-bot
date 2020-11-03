import { Message } from 'discord.js';
import { parseQuotedArgs } from '../../utils';
import { CustomError } from '../../generic/CustomError';
import { Command } from '../../generic/Command';
import { logger } from '../../logger';
import { IApplication } from '../../application';

export class DeleteCommand extends Command {
  constructor() {
    super('r-delete', 'r-delete "name"');
  }

  public async execute(
    app: IApplication,
    args: Array<string>,
    message: Message
  ) {
    const serverID = message.guild.id;
    let title: string;

    try {
      title = this.parseReminderName(app, message);
    } catch (err) {
      message.channel.send(err.embed);
      return;
    }

    const [reminder] = app.getReminderStore().getAll({ title, serverID });
    if (reminder) {
      try {
        await app.getReminderStore().delete(serverID, { title });
        message.channel.send(
          app.message(serverID, 'reminderDeleted', { reminder: title })
        );
      } catch (error) {
        console.log(error);
        message.channel.send(app.message(serverID, 'botError'));
        logger.error(error.message);
      }
    } else {
      message.channel.send(
        app.message(serverID, 'reminderNotFound', { reminder: title })
      );
      return;
    }
  }

  private parseReminderName(app: IApplication, message: Message): string {
    const msg = parseQuotedArgs(message, this.getName());

    if (msg.length < 1)
      throw new CustomError(
        app.message(message.guild.id, 'notEnoughArguments')
      );

    return msg[0];
  }
}
