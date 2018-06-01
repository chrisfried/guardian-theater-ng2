declare namespace twitch {

  interface Response {
    _links: {
      next: string,
      self: string
    },
    _total: number,
    videos: Video[]
  }

  interface Video {
    _id: string,
    _links: {
      channel: string,
      self: string
    },
    animated_preview_url: string,
    broadcast_id: number,
    broadcast_type: string,
    channel: {
      display_name: string,
      name: string
    },
    created_at: string,
    description: string,
    description_html: string,
    fps: {
      audio_only: number,
      chunked: number,
      high: number,
      low: number,
      medium: number,
      mobile: number
    },
    game: string,
    language: string,
    length: number,
    preview: string,
    published_at: string,
    recorded_at: string,
    resolutions: {
      chunked: string,
      high: string,
      low: string,
      medium: string,
      mobile: string
    },
    status: string,
    tag_list: string,
    thumbnails: {
      type: string,
      url: string
    }[],
    title: string,
    url: string,
    views: number
  }
}
