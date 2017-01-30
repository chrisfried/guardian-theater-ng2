declare namespace bungie {
  type SearchDestinyPlayerResult = {
    iconPath?: string,
    membershipType?: number,
    membershipId?: string,
    displayName?: string
  };

  type SearchDestinyPlayer = {
    Response?: SearchDestinyPlayerResult[],
    ErrorCode?: number,
    ThrottleSeconds?: number,
    ErrorStatus?: string,
    Message?: string,
    MessageData?: {}
  }

  type Character = {
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
        STAT_DEFENSE: {
          statHash: number,
          value: number,
          maximumValue: number
        },
        STAT_INTELLECT: {
          statHash: number,
          value: number,
          maximumValue: number
        },
        STAT_DISCIPLINE: {
          statHash: number,
          value: number,
          maximumValue: number
        },
        STAT_STRENGTH: {
          statHash: number,
          value: number,
          maximumValue: number
        },
        STAT_LIGHT: {
          statHash: number,
          value: number,
          maximumValue: number
        },
        STAT_ARMOR: {
          statHash: number,
          value: number,
          maximumValue: number
        },
        STAT_AGILITY: {
          statHash: number,
          value: number,
          maximumValue: number
        },
        STAT_RECOVERY: {
          statHash: number,
          value: number,
          maximumValue: number
        },
        STAT_OPTICS: {
          statHash: number,
          value: number,
          maximumValue: number
        }
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

  type Account = {
    Response: {
      data: {
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
    },
    ErrorCode: number,
    ThrottleSeconds: number,
    ErrorStatus: string,
    Message: string,
    MessageData: {}
  }
}