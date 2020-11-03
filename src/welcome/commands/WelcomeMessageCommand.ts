import { Command } from '../../generic/Command';
import { Message } from 'discord.js';
import { logger } from '../../logger';
import { IApplication } from '../../application';

export class WelcomeMessageCommand extends Command {
  constructor() {
    super('welcome-message', 'welcome-message <message>');
  }

  public async execute(
    app: IApplication,
    args: Array<string>,
    message: Message
  ) {
    const serverID = message.guild.id;
    if (args[0].toLowerCase() === 'off') {
      try {
        await app.getServerStore().update(serverID, { welcomeMessage: 'off' });
        message.channel.send(app.message(serverID, 'welcomeMessageOff'));
      } catch (error) {
        message.channel.send(app.message(serverID, 'botError'));
        logger.error(error.message);
      } finally {
        return;
      }
    }

    const welcomeMessage = message.content
      .slice(app.getConfig().prefix.length + this.getName().length)
      .trim();

    if (!welcomeMessage) {
      message.channel.send(app.message(serverID, 'welcomeMessageEmpty'));
      return;
    }

    try {
      await app.getServerStore().update(serverID, { welcomeMessage });
      message.channel.send(
        app.message(serverID, 'welcomeMessageSet', { message: welcomeMessage })
      );
    } catch (error) {
      message.channel.send(app.message(serverID, 'botError'));
      logger.error(error.message);
    }
  }
}
