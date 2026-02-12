/**
 * API 原始响应 - 歌手
 */
interface RawArtist {
    id: number;
    name: string;
    picUrl?: string;
    img1v1Url?: string;
}

/**
 * 热门歌手榜 API 响应
 */
interface TopListArtistsResponse {
    code: number;
    list: {
        artists: RawArtist[];
    };
}

export type { RawArtist, TopListArtistsResponse }