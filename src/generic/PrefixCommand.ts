import { Message } from 'discord.js';
import { IApplication } from '../application';
import { Command } from './Command';

export class PrefixCommand extends Command {
  constructor(app: IApplication) {
    super('prefix', 'prefix <new prefix>', app);
  }

  public async execute(args: string[], message: Message) {
    const serverID = message.guild.id;

    if (!this.app.isModerator(serverID, message.member)) {
      message.channel.send(this.app.message(serverID, 'noUserPerm'));
      return;
    }

    if (!args[0]) {
      message.channel.send(this.app.message(serverID, 'notEnoughArguments'));
      return;
    }

    const prefix = args[0];

    try {
      await this.app.getServerStore().update(serverID, { prefix });
      message.channel.send(
        this.app.message(serverID, 'prefixChanged', { prefix })
      );
    } catch (err) {
      message.channel.send(this.app.message(serverID, 'botError'));
      console.log(err);
    }
  }
}
