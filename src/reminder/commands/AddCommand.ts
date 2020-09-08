import { Message } from 'discord.js';
import { Job } from 'node-schedule';
import { ReminderCommand } from './ReminderCommand';
import { createEmbed } from '../../utils';

export class AddCommand extends ReminderCommand {
  constructor() {
    super(
      'r-add',
      'adds a new reminder, <name> <date> <mention> [description]'
    );
  }

  public execute(args: Array<string>, message: Message): void {
    // !r-add <name> <2020.12.24-20:30> <mention> [description]
    if (args.length < 3) {
      message.channel.send(
        createEmbed('Invalid', 'Not enough arguments!', true)
      );
      return;
    }

    const name = args[0];
    let date: Date;

    try {
      date = this.parseDate(args[1]);
    } catch (err) {
      message.channel.send(createEmbed('Invalid Date', err.message, true));
      return;
    }

    const isEveryone = message.mentions.everyone;
    const roleMention = message.mentions.roles.first();
    const userMention = message.mentions.users.first();

    if (isEveryone) {
    } else if (roleMention) {
    } else if (userMention) {
    }
  }

  private parseDate(date: string): Date {
    try {
      const [year, month, day] = date
        .split('-')[0]
        .split('.')
        .map((value, i) => (i === 1 ? Number(value) - 1 : Number(value)));

      const [hour, minute] = date
        .split('-')[1]
        .split(':')
        .map((value) => Number(value));

      const isCorrect = [year, month, day, hour, minute].some((value) =>
        isNaN(value)
      );

      if (!isCorrect)
        throw new Error(
          'You have to provide a valid date, like: 2020.11.24-20:30'
        );

      return new Date(year, month, day, hour, minute, 0);
    } catch (err) {
      throw new Error(
        'You have to provide a valid date, like: 2020.11.24-20:30'
      );
    }
  }
}
