import { Command } from '../../generic/Command';
import { Message } from 'discord.js';
import { logger } from '../../logger';
import { IApplication } from '../../application';

export class WelcomeMessageCommand extends Command {
  constructor(app: IApplication) {
    super('welcome-message', 'welcome-message <message>', app);
  }

  public async execute(args: string[], message: Message) {
    const serverID = message.guild.id;
    if (args[0].toLowerCase() === 'off') {
      try {
        await this.app
          .getServerStore()
          .update(serverID, { welcomeMessage: 'off' });
        message.channel.send(this.app.message(serverID, 'welcomeMessageOff'));
      } catch (error) {
        message.channel.send(this.app.message(serverID, 'botError'));
        logger.error(error.message);
      } finally {
        return;
      }
    }

    const welcomeMessage = message.content
      .slice(this.app.getConfig().prefix.length + this.getName().length)
      .trim();

    if (!welcomeMessage) {
      message.channel.send(this.app.message(serverID, 'welcomeMessageEmpty'));
      return;
    }

    try {
      await this.app.getServerStore().update(serverID, { welcomeMessage });
      message.channel.send(
        this.app.message(serverID, 'welcomeMessageSet', {
          message: welcomeMessage,
        })
      );
    } catch (error) {
      message.channel.send(this.app.message(serverID, 'botError'));
      logger.error(error.message);
    }
  }
}
