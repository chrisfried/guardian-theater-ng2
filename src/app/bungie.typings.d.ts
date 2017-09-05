declare namespace bungie {
  interface Response {
    Response: {},
    ErrorCode: number,
    ThrottleSeconds: number,
    ErrorStatus: string,
    Message: string,
    MessageData: {}
  }

  interface SearchDestinyPlayerResponse extends Response {
    Response: SearchDestinyPlayerResult[]
  }

  interface AccountResponse extends Response {
    Response: Account
  }

  interface ActivityHistoryResponse extends Response {
    Response: ActivityHistory
  }

  interface PostGameCarnageReportResponse extends Response {
    Response: PostGameCarnageReport
  }

  interface PartnershipResponse extends Response {
    Response: Partnership[]
  }

  interface Partnership {
    icon: string,
    identifier: string,
    name: string,
    partnerType: number
  }

  interface Definitions {
    items: {},
    buckets: {},
    stats: {},
    perks: {},
    talentGrids: {},
    statGroups: {},
    progressionMappings: {},
    itemCategories: {},
    sources: {},
    objectives: {},
    progressions: {},
    damageTypes: {},
    materialRequirements: {},
    unlockValues: {},
    vendorDetails: {},
    locations: {},
    factions: {},
    events: {},
    vendorCategories: {},
    vendorSummaries: {},
    destinations: {},
    activities: {},
    books: {},
    places: {},
    activityTypes: {},
    activityBundles: {}
  }

  interface SearchDestinyPlayerResult {
    iconPath: string,
    membershipType: number,
    membershipId: string,
    displayName: string
  }

  interface Character {
    membershipId: string,
    membershipType: number,
    characterId: string,
    dateLastPlayed: string,
    minutesPlayedThisSession: string,
    minutesPlayedTotal: string,
    light: number,
    stats: any,
    raceHash: number,
    genderHash: number,
    classHash: number,
    raceType: number,
    classType: number,
    genderType: number,
    emblemPath: string,
    emblemBackgroundPath: string,
    emblemHash: number,
    levelProgression: {
      progressionHash: number
      dailyProgress: number,
      dailyLimit: number,
      weeklyProgress: number,
      weeklyLimit: number,
      currentProgress: number,
      level: number,
      levelCap: number
      stepIndex: number,
      progressToNextLevel: number,
      nextLevelAt: number,
    },
    baseCharacterLevel: number,
    percentToNextLevel: number
  }

  interface CharacterStat {
    statHash: number,
    value: number,
    maximumValue: number
  }

  interface BasicStat {
    basic: {
      value: number,
      displayValue: string
    }
  }

  interface ActivityStat extends BasicStat {
    statId: string
  }

  interface MedalStat extends BasicStat {
    weighted: {
      value: number,
      displayValue: string
    }
  }

  interface Account {
    membershipId: string,
    membershipType: number,
    characters: {
      data: any
    },
    inventory: {
      items: {}[],
      currencies: {
        itemHash: number,
        value: number
      }[]
    },
    grimoireScore: number,
    versions: number
  }

  interface ActivityHistory {
    activities: Activity[]
  }

  interface ActivityDetails {
    referenceId: number,
    instanceId: string,
    mode: number,
    activityTypeHashOverride: number,
    isPrivate: boolean
  }

  interface Activity {
    period: string,
    activityDetails: ActivityDetails,
    values: {
      assists: ActivityStat,
      kills: ActivityStat,
      averageScorePerKill: ActivityStat,
      deaths: ActivityStat,
      averageScorePerLife: ActivityStat,
      completed: ActivityStat,
      killsDeathsRatio: ActivityStat,
      killsDeathsAssists: ActivityStat,
      activityDurationSeconds: ActivityStat,
      completionReason: ActivityStat,
      fireteamId: ActivityStat,
      startSeconds: ActivityStat,
      timePlayedSeconds: ActivityStat,
      playerCount: ActivityStat
    }
  }

  interface Team {
    teamId: number,
    standing: BasicStat,
    score: BasicStat,
    teamName: string
  }

  interface PostGameCarnageReport {
    period: string,
    activityDetails: ActivityDetails,
    entries: Entry[],
    teams: Team[]
  }

  interface Entry {
    standing: number,
    score: BasicStat,
    player: {
      destinyUserInfo: {
        iconPath: string,
        membershipType: number,
        membershipId: string,
        displayName: string
      },
      characterClass: string,
      characterLevel: number,
      lightLevel: number,
      bungieNetUserInfo?: {
        iconPath: string,
        membershipType: number,
        membershipId: string,
        displayName: string
      }
    },
    characterId: string,
    values: {
      assists: BasicStat,
      score: BasicStat,
      kills: BasicStat,
      averageScorePerKill: BasicStat,
      deaths: BasicStat,
      averageScorePerLife: BasicStat,
      completed: BasicStat,
      killsDeathsRatio: BasicStat,
      killsDeathsAssists: BasicStat,
      activityDurationSeconds: BasicStat,
      standing: BasicStat,
      team: BasicStat,
      completionReason: BasicStat,
      fireTeamId: BasicStat,
      playerCount: BasicStat,
      teamScore: BasicStat,
      leaveRemainingSeconds: BasicStat
    },
    extended: {
      weapons?: {
        referenceId: number,
        values: {
          uniqueWeaponKills: BasicStat,
          uniqueWeaponPrecisionKills: BasicStat,
          uniqueWeaponKillsPrecissionKills: BasicStat
        }
      }[],
      values: {
        secondsPlayed?: BasicStat,
        remainingTimeAfterQuitSeconds?: BasicStat,
        fireTeamId: BasicStat
      }
    },
  }
}
