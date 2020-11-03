import { ytsr } from '../../apis/searchAPI';
import { Message, Permissions, VoiceChannel } from 'discord.js';
import { Command } from '../../generic/Command';
import { checkVoiceChannelMisMatch } from '../../utils';
import { musicAPI, SongData } from '../../apis/musicAPI';
import { IApplication } from '../../application';

export class PlayCommand extends Command {
  private isSubscribed: boolean;

  constructor() {
    super('play', 'play <youtube link or name>');
    this.isSubscribed = false;
  }

  public async execute(app: IApplication, args: string[], message: Message) {
    if (!this.isSubscribed) {
      musicAPI.on('new-song-playing', this.nowPlayingHandler(app));
      this.isSubscribed = true;
    }

    const serverID = message.guild.id;
    const voiceChannel = message.member.voice.channel;
    const song = args.join(' ');
    const permissions = voiceChannel
      ? voiceChannel.permissionsFor(message.client.user)
      : null;

    const error = this.checkErrors(voiceChannel, permissions, args);
    if (error) {
      message.channel.send(app.message(serverID, error));
      return;
    }

    if (musicAPI.hasQueue(serverID)) {
      this.handleExisting(app, message, voiceChannel, serverID, song);
    } else {
      this.handleNew(app, message, voiceChannel, serverID, song);
    }
  }

  private async handleExisting(
    app: IApplication,
    message: Message,
    voiceChannel: VoiceChannel,
    serverID: string,
    song: string
  ) {
    if (checkVoiceChannelMisMatch(message, voiceChannel)) {
      message.channel.send(app.message(serverID, 'noVoiceChannelMatch'));
      return;
    }
    const music = await this.handleMusicRetrieving(app, song, message);
    if (!music) return;
    musicAPI.queue(serverID, music);
    message.channel.send(
      app.message(serverID, 'songQueued', { song: music.title })
    );
  }

  private async handleNew(
    app: IApplication,
    message: Message,
    voiceChannel: VoiceChannel,
    serverID: string,
    song: string
  ) {
    try {
      const music = await this.handleMusicRetrieving(app, song, message);
      if (!music) return;
      if (!musicAPI.isConnected(serverID))
        await musicAPI.connect(serverID, voiceChannel);
      musicAPI.queue(serverID, music);
      musicAPI.startPlaying(serverID);
    } catch (error) {
      message.channel.send(app.message(serverID, 'cantJoinVoice'));
    }
  }

  private checkErrors(
    voiceChannel: VoiceChannel,
    permissions: Readonly<Permissions>,
    args: Array<string>
  ): string {
    if (!args || args.length < 1) return 'notEnoughArguments';
    else if (!voiceChannel) return 'notInVoiceChannel';
    else if (!permissions.has('CONNECT')) return 'noBotPermToJoinVoice';
    else if (!permissions.has('SPEAK')) return 'noBotPermToSpeak';
  }

  private async getMusicData(query: string, message: Message) {
    const channel = message.channel;
    if (musicAPI.validateYoutubeUrl(query)) {
      const info = await musicAPI.getVideoDetails(query);
      return { ...info, channel };
    }
    const info = await ytsr(query);
    if (!info) return null;
    return { ...info, channel };
  }

  private async handleMusicRetrieving(
    app: IApplication,
    song: string,
    message: Message
  ) {
    const music = await this.getMusicData(song, message);
    if (!music) {
      message.channel.send(
        app.message(message.guild.id, 'songNotFound', { song })
      );
      return null;
    }
    return music;
  }

  private nowPlayingHandler(app: IApplication) {
    return (serverID: string, music: SongData) => {
      const { channel, title: song } = music;
      channel.send(app.message(serverID, 'nowPlaying', { song }));
    };
  }
}
