import { Message } from 'discord.js';
import { IApplication } from '../application';

export abstract class Command {
  /**
   * Reference name for the command.
   * eg.: !play bestmusicever, where play is the name
   */
  private name: string;

  /**
   * Shows how to use the command.
   */
  private usage: string;

  /**
   * Main application, that controls the command.
   */
  protected app: IApplication;

  /**
   * Constructor to initialize the name.
   *
   * @param name name/prefix for the command.
   */
  constructor(name: string, usage: string, app: IApplication) {
    this.name = name;
    this.usage = usage;
    this.app = app;
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
  public getDescription(app: IApplication, locale: string): string {
    return app.getCommandDescription(locale, this.name);
  }

  /**
   * @returns usage string for the command
   */
  public getUsage(): string {
    return this.usage;
  }
}
