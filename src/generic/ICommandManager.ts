import { Command } from './Command';
import { Message } from 'discord.js';

export interface ICommandManager {
  addCommand(command: Command): void;
  removeCommand(commandName: string): void;
  handle(command: string, args: string[], message: Message): void;
  getCommands(): Array<Command>;
  getCommandNames(): Array<string>;
}

export abstract class CommandManager implements ICommandManager {
  protected commands: Map<string, Command>;
  protected name: string;

  constructor(name: string) {
    this.name = name;
    this.commands = new Map<string, Command>();
  }

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

  abstract handle(command: string, args: string[], message: Message): void;
}
