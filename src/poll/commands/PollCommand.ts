import { Message } from 'discord.js';
import { Command } from '../../generic/Command';

export class PollCommand extends Command {
  constructor() {
    super('poll', 'poll "question" "answer1" "answer2" "answerX"');
  }

  public execute(args: string[], message: Message): void {
    message.reply('elhitted lol');
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
