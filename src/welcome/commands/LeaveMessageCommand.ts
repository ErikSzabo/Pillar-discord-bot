import { Message } from 'discord.js';
import { Command } from '../../generic/Command';
import { logger } from '../../logger';
import { IApplication } from '../../application';

export class LeaveMessageCommand extends Command {
  constructor(app: IApplication) {
    super('leave-message', 'leave-message <message>', app);
  }

  public async execute(args: string[], message: Message) {
    const serverID = message.guild.id;
    if (args[0].toLowerCase() === 'off') {
      try {
        await this.app
          .getServerStore()
          .update(serverID, { leaveMessage: 'off' });
        message.channel.send(this.app.message(serverID, 'leaveMessageOff'));
      } catch (error) {
        message.channel.send(this.app.message(serverID, 'botError'));
        logger.error(error.message);
      } finally {
        return;
      }
    }

    const leaveMessage = message.content
      .slice(this.app.getConfig().prefix.length + this.getName().length)
      .trim();

    if (!leaveMessage) {
      message.channel.send(this.app.message(serverID, 'leaveMessageEmpty'));
      return;
    }

    try {
      await this.app.getServerStore().update(serverID, { leaveMessage });
      message.channel.send(
        this.app.message(serverID, 'leaveMessageSet', { message: leaveMessage })
      );
    } catch (error) {
      message.channel.send(this.app.message(serverID, 'botError'));
      logger.error(error.message);
    }
  }
}
