/**
 * 获取推荐歌单（未登录用户）
 * @param limit - 数量限制
 */

import type { Playlist } from "@/types/entities/playlist";
import request from "@/api/request";
import type {
    RawPlaylist,
    RecommendPlaylistResponse,
    DailyRecommendPlaylistResponse,
    TopListsResponse
} from "@/types/api/playList.type";

/**
 * 获取推荐歌单（未登录用户）
 * @param limit - 数量限制
 */
const getRecommentPlayList = async (limit: number = 30): Promise<Playlist[]> => {
    const res = await request.get<any, RecommendPlaylistResponse>("/personalized", {
        params: { limit }
    })

    return res.result.map(transformPlaylist)
}

/**
 * 获取每日推荐歌单（需要登录）
 */
const getDailyRecommendPlaylist = async (): Promise<Playlist[]> => {
    const res = await request.get<any, DailyRecommendPlaylistResponse>(
        "/recommend/resource",
        {
            params: { timestamp: Date.now() },
        },
    );

    return (res.recommend || []).map(transformPlaylist);
}

/**
 * 获取所有榜单
 */

const getTopList = async (): Promise<Playlist[]> => {
    const res = await request.get<any, TopListsResponse>("/toplist");

    return res.list.map(transformPlaylist);
}

/**
 * 转换歌单数据为标准格式
 */
const transformPlaylist = (raw: RawPlaylist): Playlist => {
    return {
        id: raw.id,
        name: raw.name,
        coverImgUrl: raw.coverImgUrl,
        picUrl: raw.picUrl,
        playCount: raw.playCount,
        trackCount: raw.trackCount,
        creator: raw.creator
            ? {
                userId: raw.creator.userId,
                nickname: raw.creator.nickname,
            }
            : undefined,
        copywriter: raw.copywriter,
        updateFrequency: raw.updateFrequency,
    };
}

export { getRecommentPlayList, getDailyRecommendPlaylist, getTopList }