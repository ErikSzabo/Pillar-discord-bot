import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { logger } from '../../logger';
import { IApplication } from '../../application';

export class LeaveMessageCommand extends Command {
  constructor() {
    super('leave-message', 'leave-message <message>');
  }

  public async execute(
    app: IApplication,
    args: Array<string>,
    message: Message
  ) {
    const serverID = message.guild.id;
    if (args[0].toLowerCase() === 'off') {
      try {
        await app.getServerStore().update(serverID, { leaveMessage: 'off' });
        message.channel.send(app.message(serverID, 'leaveMessageOff'));
      } catch (error) {
        message.channel.send(app.message(serverID, 'botError'));
        logger.error(error.message);
      } finally {
        return;
      }
    }

    const leaveMessage = message.content
      .slice(app.getConfig().prefix.length + this.getName().length)
      .trim();

    if (!leaveMessage) {
      message.channel.send(app.message(serverID, 'leaveMessageEmpty'));
      return;
    }

    try {
      await app.getServerStore().update(serverID, { leaveMessage });
      message.channel.send(
        app.message(serverID, 'leaveMessageSet', { message: leaveMessage })
      );
    } catch (error) {
      message.channel.send(app.message(serverID, 'botError'));
      logger.error(error.message);
    }
  }
}
