import { Message } from 'discord.js';

export abstract class Command {
  /**
   * Reference name for the command.
   * eg.: !play bestmusicever, where play is the name
   */
  private name: string;

  /**
   * Description which used by the help command mainly.
   */
  private description: string;

  /**
   * Constructor to initialize the name.
   *
   * @param name name/prefix for the command.
   */
  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }

  /**
   * Executes the command based on the message and arguments.
   *
   * @param args     command arguments
   * @param message  command message
   */
  abstract execute(args: Array<string>, message: Message): void;

  /**
   * @returns the name of the command
   */
  public getName(): string {
    return this.name;
  }

  /**
   * @returns the description of the command
   */
  public getDescription(): string {
    return this.description;
  }
}
