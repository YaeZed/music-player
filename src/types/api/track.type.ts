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

export type { TrackDetailResponse, RawTrack }