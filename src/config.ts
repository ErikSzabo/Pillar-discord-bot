/**
 * Default configuration for the bot.
 */
export const config: Config = {
  /**
   * The bot only reacts to those messages that starts with this prefix.
   */
  prefix: '!',
  /**
   * Id of a discord user who owns the current instance of the bot.
   */
  operator: '357219814223249429',
  /**
   * Whether the bot is in beta or not.
   */
  beta: true,
};

export interface Config {
  prefix: string;
  operator: string;
  beta: boolean;
}
