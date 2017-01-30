declare namespace bungie {
  interface Response {
    Response: {},
    ErrorCode?: number,
    ThrottleSeconds?: number,
    ErrorStatus?: string,
    Message?: string,
    MessageData?: {}
  }

  interface SearchDestinyPlayerResponse extends Response {
    Response: SearchDestinyPlayerResult[]
  }

  interface AccountResponse extends Response {
    Response: {
      data: Account,
      definitions?: Definitions
    }
  }

  interface ActivityHistoryResponse extends Response {
    Response: {
      data: ActivityHistory,
      definitions?: Definitions
    } 
  }

  interface PostGameCarnageReportResponse extends Response {
    Response: {
      data: PostGameCarnageReport,
      definitions?: Definitions
    } 
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
    iconPath?: string,
    membershipType?: number,
    membershipId?: string,
    displayName?: string
  }

  interface Character {
    characterBase: {
      membershipId: string,
      membershipType: number,
      characterId: string,
      dateLastPlayed: string,
      minutesPlayedThisSession: string,
      minutesPlayedTotal: string,
      powerLevel: number,
      raceHash: number,
      genderHash: number,
      classHash: number,
      currentActivityHash: number,
      lastCompletedStoryHash: number,
      stats: {
        STAT_DEFENSE: CharacterStat,
        STAT_INTELLECT: CharacterStat,
        STAT_DISCIPLINE: CharacterStat,
        STAT_STRENGTH: CharacterStat,
        STAT_LIGHT: CharacterStat,
        STAT_ARMOR: CharacterStat,
        STAT_AGILITY: CharacterStat,
        STAT_RECOVERY: CharacterStat,
        STAT_OPTICS: CharacterStat
      },
      customization: {
        personality: number,
        face: number,
        skinColor: number,
        lipColor: number,
        eyeColor: number,
        hairColor: number,
        featureColor: number,
        decalColor: number,
        wearHelmet: boolean,
        hairIndex: number,
        featureIndex: number,
        decalIndex: number
      },
      grimoireScore: number,
      peerView: {
        equipment: {
          itemHash: number,
          dyes: {
            channelHash: number,
            dyeHash: number
          }[]
        }[]
      },
      genderType: number,
      classType: number,
      buildStatGroupHash: number
    },
    levelProgression: {
      dailyProgress: number,
      weeklyProgress: number,
      currentProgress: number,
      level: number,
      step: number,
      progressToNextLevel: number,
      nextLevelAt: number,
      progressionHash: number
    },
    emblemPath: string,
    backgroundPath: string,
    emblemHash: number,
    characterLevel: number,
    baseCharacterLevel: number,
    isPrestigeLevel: boolean,
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
    characters: Character[],
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
      activityDurationSeconds: ActivityStat,
      standing: ActivityStat,
      completionReason: ActivityStat,
      playerCount: ActivityStat,
      raceCompletionMilliseconds: ActivityStat
    }
  }

  interface PostGameCarnageReport {
      period: string,
      activityDetails: ActivityDetails,
      entries: {
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
            secondsPlayed?: BasicStat
          }
        }
      }[],
      teams: {
        teamId: number,
        standing: BasicStat,
        score: BasicStat,
        teamName: string
      }[]
  }
}