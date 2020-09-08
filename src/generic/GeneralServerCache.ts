import { serverInfo } from '../database';

export interface ServerInfo {
  serverID: string;
  musicChannel: string;
  moderationRole: string;
  pollRole: string;
  watchTogetherRole: string;
  welcomeChannel: string;
  welcomeMessage: string;
  leaveMessage: string;
}

export enum messageType {
  LEAVE = 'leaveMessage',
  WELCOME = 'welcomeMessage',
}

export enum roleType {
  MODERATION = 'moderationRole',
  POLL = 'pollRole',
  WATCH = 'watchTogetherRole',
}

export enum channelType {
  MUSIC = 'musicChannel',
  WELCOME = 'welcomeChannel',
}

export const generalServerCache = (() => {
  const cache = new Map<string, ServerInfo>();

  const isCached = (serverID: string): boolean => {
    return cache.has(serverID);
  };

  const saveToCache = async (serverID: string): Promise<void> => {
    const server: ServerInfo = await serverInfo.findOne({ serverID });
    if (server) {
      cache.set(serverID, server);
      return;
    }

    const construct = {
      serverID: serverID,
      musicChannel: 'off',
      moderationRole: 'off',
      pollRole: 'off',
      watchTogetherRole: 'off',
      welcomeChannel: 'off',
      welcomeMessage: '[USER] joined the server!',
      leaveMessage: '[USER] leaved the server!',
    };

    cache.set(serverID, construct);

    await serverInfo.insert(construct);
  };

  const setMessage = async (
    type: messageType,
    serverID: string,
    message: string
  ): Promise<void> => {
    cache.get(serverID)[type] = message;
    await serverInfo.findOneAndUpdate(
      { serverID },
      { $set: { [`${type}`]: message } }
    );
  };

  const setChannel = async (
    type: channelType,
    serverID: string,
    channel: string
  ): Promise<void> => {
    cache.get(serverID)[type] = channel;
    await serverInfo.findOneAndUpdate(
      { serverID },
      { $set: { [`${type}`]: channel } }
    );
  };

  const setRole = async (
    type: roleType,
    serverID: string,
    role: string
  ): Promise<void> => {
    cache.get(serverID)[type] = role;
    await serverInfo.findOneAndUpdate(
      { serverID },
      { $set: { [`${type}`]: role } }
    );
  };

  const getMessage = (type: messageType, serverID: string): string => {
    return cache.get(serverID)[type];
  };

  const getRole = (type: roleType, serverID: string): string => {
    return cache.get(serverID)[type];
  };

  const getChannel = (type: channelType, serverID: string): string => {
    return cache.get(serverID)[type];
  };

  const fullRemove = (serverID: string): void => {
    cache.delete(serverID);
    serverInfo.findOneAndDelete({ serverID });
  };

  const loadCache = async (): Promise<void> => {
    const servers = await serverInfo.find({});
    servers.forEach((server) => {
      cache.set(server.serverID, server);
    });
  };

  return {
    isCached,
    saveToCache,
    fullRemove,
    loadCache,
    setRole,
    setMessage,
    setChannel,
    getRole,
    getMessage,
    getChannel,
  };
})();
