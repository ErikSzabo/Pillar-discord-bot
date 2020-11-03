import { Command } from './Command';
import { Message } from 'discord.js';
import { IApplication } from '../application';

/**
 * Interface for command managers.
 */
export interface ICommandManager {
  addCommand(command: Command): void;
  removeCommand(commandName: string): void;
  handle(
    app: IApplication,
    command: string,
    args: string[],
    message: Message
  ): void;
  getCommands(): Array<Command>;
  getCommandNames(): Array<string>;
}

/**
 * Abstract CommandManager class, implements the default functionality.
 */
export abstract class CommandManager implements ICommandManager {
  protected commands: Map<string, Command>;
  protected name: string;

  /**
   * Constructor to setup the commandManager name and its commands.
   *
   * @param name name of the CommandManager, will be displayed in the help page
   */
  constructor(name: string) {
    this.name = name;
    this.commands = new Map<string, Command>();
  }

  /**
   * Adds a command to the manager.
   *
   * @param command command to add to the manager
   */
  public addCommand(command: Command): void {
    this.commands.set(command.getName(), command);
  }

  /**
   * Removes a command from a manager.
   *
   * @param commandName name of the command which will be removed from the manager
   */
  public removeCommand(commandName: string): void {
    this.commands.delete(commandName);
  }

  /**
   * @returns All of the commands in the manager.
   */
  public getCommands(): Array<Command> {
    return Array.from(this.commands.values());
  }

  /**
   * @returns the names of the commands in the command manager
   */
  public getCommandNames(): Array<string> {
    return Array.from(this.commands.keys());
  }

  /**
   * @returns the name of the command manager
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Forwards the information to the right command if possible.
   *
   * @param command command name
   * @param args    command arguments
   * @param message discord message
   */
  abstract handle(
    app: IApplication,
    command: string,
    args: string[],
    message: Message
  ): void;
}
