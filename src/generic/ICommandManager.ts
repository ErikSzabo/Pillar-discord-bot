import { Command } from './Command';
import { Message } from 'discord.js';
import { IApplication } from '../application';

/**
 * Interface for command managers.
 */
export interface ICommandManager {
  /**
   * Adds a command to the manager.
   *
   * @param command command to add to the manager
   */
  addCommand(command: Command): void;
  /**
   * Removes a command from a manager.
   *
   * @param commandName name of the command which will be removed from the manager
   */
  removeCommand(commandName: string): void;
  /**
   * @returns All of the commands in the manager.
   */
  getCommands(): Command[];
  /**
   * @returns the names of the commands in the command manager
   */
  getCommandNames(): string[];
  /**
   * Creates and initializes the commands in the manager.
   *
   * @param app main application
   */
  initialize(app: IApplication): void;
  /**
   * @returns the name of the command manager
   */
  getName(): string;
  /**
   * Forwards the information to the right command if possible.
   *
   * @param command command name
   * @param args    command arguments
   * @param message discord message
   */
  handle(
    app: IApplication,
    command: string,
    args: string[],
    message: Message
  ): void;
}

export abstract class CommandManager implements ICommandManager {
  protected commands: Map<string, Command>;
  protected name: string;

  constructor(name: string) {
    this.name = name;
    this.commands = new Map<string, Command>();
  }

  public abstract initialize(app: IApplication): void;

  public addCommand(command: Command): void {
    this.commands.set(command.getName(), command);
  }

  public removeCommand(commandName: string): void {
    this.commands.delete(commandName);
  }

  public getCommands(): Array<Command> {
    return Array.from(this.commands.values());
  }

  public getCommandNames(): Array<string> {
    return Array.from(this.commands.keys());
  }

  public getName(): string {
    return this.name;
  }

  abstract handle(
    app: IApplication,
    command: string,
    args: string[],
    message: Message
  ): void;
}
