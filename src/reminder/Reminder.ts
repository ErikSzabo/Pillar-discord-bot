export interface Reminder {
  _id?: string;
  serverID: string;
  mentionID: string;
  type: 'everyone' | 'role' | 'user';
  title: string;
  description: string;
  date: Date;
  channel: string;
}
