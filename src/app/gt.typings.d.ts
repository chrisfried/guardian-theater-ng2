declare namespace gt {
  interface ClipLimiter {
    self: boolean,
    fireteam: boolean,
    team: boolean,
    opponents: boolean,
    xbox: boolean,
    twitch: boolean
  }

  interface Activity extends bungie.Activity {
    pgcr?: PostGameCarnageReport,
    loadingPgcr?: boolean
  }

  interface PostGameCarnageReport extends bungie.PostGameCarnageReport {
    entries: Entry[],

    clips$?: any,
    filteredClips$?: any,

    loading?: {
      message: string,
      twitch: boolean,
      bungie: boolean,
      xbox: boolean
    },

    clips?: Clip[],

    showClips?: boolean,

    active?: {
      entry: Entry,
      team: number,
      fireteam: number
    }
  }

  interface Entry extends bungie.Entry {
    startTime?: number,
    stopTime?: number,
    twitchClips?: twitch.Video[],
    xboxClips?: xbox.Video[],
    iconUrl?: any,
    xbox?: {
      checked: boolean,
      gamertag: string,
      response: xbox.Response
    }
    twitch?: {
      checkedId: boolean,
      twitchId: string,
      bungieId: string,
      checkedResponse: boolean,
      response: {}
    },
    clips?: Clip[],
  }

  interface Clip {
    type: string,
    start: number,
    video: (xbox.Video | twitch.Video),
    entry: Entry,
    embedUrl?: any
  }
}