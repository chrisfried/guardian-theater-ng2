declare namespace mixer {
  interface Video {
    id: number;
    name: string;
    typeId: number;
    state: string;
    viewsTotal: number;
    duration: number;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
    channelId: number;
    vods: Vod[];
  }

  interface Vod {
    data: VodData;
    id: number;
    baseUrl: string;
    format: string;
    createdAt: string;
    updatedAt: string;
    recordingId: number;
  }

  interface VodData {
    Width: number;
    Height: number;
    Has720pPreview: boolean;
    Fps: number;
    Bitrate: number;
  }
}
