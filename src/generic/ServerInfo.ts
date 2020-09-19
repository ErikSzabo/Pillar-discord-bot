/**
 * Interface to define server information.
 */
export interface ServerInfo {
  serverID: string;
  musicChannel: string;
  moderationRole: string;
  pollRole: string;
  welcomeChannel: string;
  welcomeMessage: string;
  leaveMessage: string;
  language: string;
}
