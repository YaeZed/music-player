// 网易云api返回的歌单格式
/**
 * API 原始响应 - 推荐歌单
 */
interface RawPlaylist {
    id: number;
    name: string;
    coverImgUrl: string;
    picUrl: string;
    playCount?: number;
    trackCount?: number;
    creator?: {
        userId: number;
        nickname: string;
    };
    copywriter?: string;
    updateFrequency?: string;
}

/**
 * 推荐歌单 API 响应
 */
interface RecommendPlaylistResponse {
    code: number;
    result: RawPlaylist[];
}

/**
 * 每日推荐歌单 API 响应
 */
interface DailyRecommendPlaylistResponse {
    code: number;
    recommend: RawPlaylist[];
}

/**
 * 所有榜单 API 响应
 */
interface TopListsResponse {
    code: number;
    list: RawPlaylist[];
}

export type { RawPlaylist, RecommendPlaylistResponse, DailyRecommendPlaylistResponse, TopListsResponse }