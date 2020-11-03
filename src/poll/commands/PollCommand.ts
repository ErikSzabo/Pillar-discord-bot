import { Message, MessageEmbed } from 'discord.js';
import { IApplication } from '../../application';
import { Command } from '../../generic/Command';
import { parseQuotedArgs } from '../../utils';

export class PollCommand extends Command {
  constructor(app: IApplication) {
    super('poll', 'poll "question" "answer1" "answer2" "answerX"', app);
  }

  public execute(args: string[], message: Message): void {
    args = parseQuotedArgs(message, this.getName());
    const serverID = message.guild.id;
    if (args.length <= 1) {
      message.channel.send(this.app.message(serverID, 'pollQuestionRequired'));
      return;
    }
    if (args.length > 20) {
      message.channel.send(this.app.message(serverID, 'pollOptionLimit'));
      return;
    }

    const question = args[0];

    message.channel
      .send(this.createPollEmbed(question, args.slice(1), message))
      .then((msg) => {
        args.slice(1).forEach((arg, i) => msg.react(options[i]));
      });
  }

  private createPollEmbed(
    question: string,
    answers: string[],
    message: Message
  ): MessageEmbed {
    const embed = new MessageEmbed();
    embed.setTitle(question + '\n' + '____');
    embed.setColor('#0099ff');
    embed.setAuthor(message.member.displayName, message.author.avatarURL());
    embed.setDescription(
      answers.map((answer, i) => `${options[i]} - ${answer}\n`)
    );
    return embed;
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
