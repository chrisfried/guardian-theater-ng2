import {
  DestinyPostGameCarnageReportData,
  DestinyPostGameCarnageReportEntry,
  DestinyPostGameCarnageReportTeamEntry,
  DestinyHistoricalStatsPeriodGroup
} from 'bungie-api-ts/destiny2';

declare namespace gt {
  interface ClipLimiter {
    self?: boolean;
    fireteam?: boolean;
    team?: boolean;
    opponents?: boolean;
  }

  interface Activity extends DestinyHistoricalStatsPeriodGroup {
    pgcr?: PostGameCarnageReport;
    loadingPgcr?: boolean;
  }

  interface Team extends DestinyPostGameCarnageReportTeamEntry {
    entries?: Entry[];
    trialsLink?: string;
  }

  interface PostGameCarnageReport extends DestinyPostGameCarnageReportData {
    entries: Entry[];

    teams: Team[];

    clips$?: any;
    filteredClips$?: any;

    loading?: {
      message: string;
      twitch: boolean;
      bungie: boolean;
      xbox: boolean;
    };

    clips?: Clip[];

    showClips?: boolean;

    active?: {
      entry: Entry;
      team: number;
      fireteam: number;
    };
  }

  interface Entry extends DestinyPostGameCarnageReportEntry {
    twitchId?: string;
    startTime?: number;
    stopTime?: number;
    twitchClips?: twitch.Video[];
    xboxClips?: xbox.Video[];
    iconUrl?: any;
    xbox?: {
      checked: boolean;
      gamertag: string;
      response: xbox.Response;
    };
    twitch?: TwitchServiceItem;
    mixer?: MixerServiceItem;
    clips?: Clip[];
    trn?: string;
  }

  interface TwitchServiceItem {
    displayName: string;
    membershipId: string;
    twitchName?: string;
    twitchId?: number;
    checkedBungieIdForTwitchName?: boolean;
    lookedUpTwitchIdFromTwitchName?: boolean;
    checkedScreenAPIForTwitchId?: boolean;
    checkedForClipsForTwitchId?: boolean;
    response?: twitch.Response;
    notFound?: boolean;
  }

  interface MixerServiceItem {
    displayName: string;
    membershipId: string;
    channelName?: string;
    channelId?: string;
    response?: mixer.Video[];
    checkedScreenAPIForMixerId?: boolean;

    checkedId?: boolean;
    checkedResponse?: boolean;
  }

  interface Clip {
    type: 'xbox' | 'twitch' | 'mixer';
    start: number;
    video: xbox.Video | twitch.Video | mixer.Video;
    entry: Entry;
    embedUrl?: any;
    vodUrl?: any;
    hhmmss?: string;
    play?: boolean;
  }

  interface Links {
    activity?: {
      bungie?: boolean;
      tracker?: boolean;
      ggg?: boolean;
      trials?: boolean;
      options?: boolean;
    };
    guardian?: {
      bungie?: boolean;
      twitch?: boolean;
      mixer?: boolean;
      tracker?: boolean;
      ggg?: boolean;
      options?: boolean;
      platform?: boolean;
    };
    xbox?: {
      recordus?: boolean;
      dvr?: boolean;
      clips?: boolean;
      gamedtv?: boolean;
      xbox?: boolean;
      download?: boolean;
      options?: boolean;
    };
  }
}
