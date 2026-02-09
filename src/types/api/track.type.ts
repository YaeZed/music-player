// 网易云api返回的格式
interface TrackDetailResponse {
    code: number;
    songs: RawTrack[];
}

interface RawTrack {
    id: number;
    name: string;
    // artists
    ar: {
        id: number;
        name: string;
    }[],
    // album
    al: {
        id: number;
        name: string;
        picUrl: string;
    }
    // duration
    dt: number;
}

interface LyricResponse {
    code: number;
    lrc?: {
        lyric: string // lrc格式歌词
    };
    tlyric?: {
        lyric: string // 翻译歌词
    }
}

export type { TrackDetailResponse, RawTrack, LyricResponse }