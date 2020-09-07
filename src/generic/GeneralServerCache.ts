import { serverInfo } from '../database';

export interface ServerInfo {
  serverID: string;
  musicChannel: string;
  moderationRole: string;
  pollRole: string;
  watchTogetherRole: string;
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
    };

    cache.set(serverID, construct);

    await serverInfo.insert(construct);
  };

  const setMusicChannel = async (
    serverID: string,
    musicChannel: string
  ): Promise<void> => {
    cache.get(serverID).musicChannel = musicChannel;
    await serverInfo.findOneAndUpdate({ serverID }, { $set: { musicChannel } });
  };

  const setModerationRole = async (
    serverID: string,
    moderationRole: string
  ): Promise<void> => {
    cache.get(serverID).moderationRole = moderationRole;
    await serverInfo.findOneAndUpdate(
      { serverID },
      { $set: { moderationRole } }
    );
  };

  const setPollRole = async (
    serverID: string,
    pollRole: string
  ): Promise<void> => {
    cache.get(serverID).pollRole = pollRole;
    await serverInfo.findOneAndUpdate({ serverID }, { $set: { pollRole } });
  };

  const setWatchTogetherRole = async (
    serverID: string,
    watchTogetherRole: string
  ): Promise<void> => {
    cache.get(serverID).watchTogetherRole = watchTogetherRole;
    await serverInfo.findOneAndUpdate(
      { serverID },
      { $set: { watchTogetherRole } }
    );
  };

  const getMusicChannel = (serverID: string): string => {
    return cache.get(serverID).musicChannel;
  };

  const getModerationRole = (serverID: string): string => {
    return cache.get(serverID).moderationRole;
  };

  const getPollRole = (serverID: string): string => {
    return cache.get(serverID).pollRole;
  };

  const getWatchTogetherRole = (serverID: string): string => {
    return cache.get(serverID).watchTogetherRole;
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
    setMusicChannel,
    setModerationRole,
    setPollRole,
    setWatchTogetherRole,
    getMusicChannel,
    getModerationRole,
    getPollRole,
    getWatchTogetherRole,
    fullRemove,
    loadCache,
  };
})();
