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
  timezone: timeZone;
  prefix: string;
}

type timeZone =
  | 'CET'
  | 'CEST'
  | 'UTC'
  | 'EET'
  | 'MSK'
  | 'PST'
  | 'PDT'
  | 'MST'
  | 'MDT'
  | 'CST'
  | 'CDT'
  | 'EST'
  | 'EDT';
