import { MessageEmbed } from 'discord.js';

/**
 * Error to throw the embed message with the error as well.
 */
export class CustomError extends Error {
  public embed: MessageEmbed;

  constructor(embed: MessageEmbed) {
    super();
    this.embed = embed;
  }
}
