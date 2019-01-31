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
    xbox?: boolean;
    twitch?: boolean;
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
    clips?: Clip[];
    trn?: string;
  }

  interface TwitchServiceItem {
    displayName: string;
    membershipId: string;
    checkedId?: boolean;
    twitchId?: string;
    checkedResponse?: boolean;
    response?: twitch.Response;
    notFound?: boolean;
    checkedScreenAPI?: boolean;
    checkedScreenResponse?: boolean;
  }

  interface Clip {
    type: string;
    start: number;
    video: xbox.Video | twitch.Video;
    entry: Entry;
    embedUrl?: any;
    hhmmss?: string;
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
