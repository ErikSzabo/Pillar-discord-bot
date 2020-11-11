import { count } from 'console';
import { Message, MessageEmbed } from 'discord.js';
import { IApplication } from '../../application';
import { Command } from '../../generic/Command';
import { parseQuotedArgs } from '../../utils';

export class PollCommand extends Command {
  constructor(app: IApplication) {
    super(
      'poll',
      'poll <duration (2m, 30s)> "question" "answer1" "answer2" "answerX"',
      app
    );
  }

  public async execute(args: string[], message: Message) {
    args = parseQuotedArgs(message, this.getName());
    const serverID = message.guild.id;
    if (args.length <= 2) {
      message.channel.send(this.app.message(serverID, 'pollQuestionRequired'));
      return;
    }
    if (args.length > 21) {
      message.channel.send(this.app.message(serverID, 'pollOptionLimit'));
      return;
    }

    const duration = this.parseDuration(args[0]);
    if (duration == null) {
      message.channel.send(this.app.message(serverID, 'invalidPollDuration'));
      return;
    }

    if (duration > 10 * 60 * 1000) {
      message.channel.send(this.app.message(serverID, 'poll10MinLimit'));
      return;
    }
    const question = args[1];
    const answers = args.slice(2);

    const msg = await message.channel.send(
      this.createPollEmbed(question, answers, args[0], message)
    );
    answers.forEach((arg, i) => msg.react(options[i]));

    const pollFinish = () => {
      const counter: number[] = [];
      answers.forEach((answer, i) => {
        const reactionNumber = msg.reactions.cache.get(options[i]).count;
        counter.push(reactionNumber);
      });
      const winner = answers[counter.indexOf(Math.max(...counter))];
      message.channel.send(
        this.app.message(serverID, 'pollWinner', { message: winner })
      );
    };

    this.app
      .getScheduler()
      .schedule(
        serverID,
        `poll${question}${duration}`,
        new Date(Date.now() + duration),
        pollFinish
      );
  }

  private createPollEmbed(
    question: string,
    answers: string[],
    duration: string,
    message: Message
  ): MessageEmbed {
    const embed = new MessageEmbed();
    embed.setTitle(question + '\n' + '____');
    embed.setColor('#0099ff');
    embed.setAuthor(message.member.displayName, message.author.avatarURL());
    embed.setDescription(
      answers.map((answer, i) => `${options[i]} - ${answer}\n`)
    );
    embed.setFooter(`🕓 ${duration}`);
    return embed;
  }

  private parseDuration(duration: string): number {
    const multipler: any = { h: 60 * 60 * 1000, m: 60 * 1000, s: 1000 };
    const format = /^([1-9]+)(s|m)$/g;
    const matches = format.exec(duration);
    return matches ? parseInt(matches[1]) * multipler[matches[2]] : null;
  }
}

const options = [
  '🇦',
  '🇧',
  '🇨',
  '🇩',
  '🇪',
  '🇫',
  '🇬',
  '🇭',
  '🇮',
  '🇯',
  '🇰',
  '🇱',
  '🇲',
  '🇳',
  '🇴',
  '🇵',
  '🇶',
  '🇷',
  '🇸',
  '🇹',
  '🇺',
  '🇻',
  '🇼',
  '🇽',
  '🇾',
  '🇿',
];
