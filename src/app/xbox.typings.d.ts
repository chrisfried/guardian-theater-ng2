declare namespace xbox {

  interface Response {
    gameClips: {}[],
    pagingInfo: {
      continuationToken: string
    }
  }

  interface Video {
    achievementId: string,
    clipContentAttributes: string,
    clipName: string,
    commentCount: number,
    datePublished: string,
    dateRecorded: string,
    deviceType: string,
    durationInSeconds: number,
    gameClipId: string,
    gameClipLocale: string,
    gameClipUris: {
      expiration: string,
      fileSize: number,
      uri: string,
      uriType: string
    }[],
    greatestMomentId: string,
    lastModified: string,
    likeCount: number,
    partialViews: number,
    rating: number,
    ratingCount: number,
    savedByUser: boolean,
    scid: string,
    shareCount: number,
    state: string,
    systemProperties: string,
    thumbnails: {
      fileSize: number,
      thumbnailType: string,
      uri: string
    }[],
    titleData: string,
    titleId: number,
    titleName: string,
    type: string,
    userCaption: string,
    views: number,
    xuid: string
  }
}
