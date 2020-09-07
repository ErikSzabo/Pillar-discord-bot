import { MessageEmbed } from 'discord.js';

export class CustomError extends Error {
  public embed: MessageEmbed;

  constructor(embed: MessageEmbed) {
    super();
    this.embed = embed;
  }
}
