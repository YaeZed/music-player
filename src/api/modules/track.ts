import type { Track } from "@/types/entities/track"
import type { RawTrack, TrackDetailResponse } from "@/types/api/track.type"
import request from "../request"
/**
 * 获取歌曲详情
 * @params ids - 歌曲id
 */
const getTrackDetail = async (ids: number | string): Promise<Track[]> => {
    // 调用api
    // 在调用 get 时传入两个泛型参数。Axios 的第二个泛型参数决定了最终返回值的类型。
    // 第一个泛型是后端返回的数据结构，第二个泛型是经过拦截器处理后的实际返回结构
    const res = await request.get<any, TrackDetailResponse>("/song/detail/", {
        params: { ids: String(ids) },
    })

    // 转化为标准模式
    return res.songs.map(transformTrack)
}

// 类型转换函数
const transformTrack = (raw: RawTrack): Track => {
    return {
        id: raw.id,
        name: raw.name,
        artists: raw.ar.map((a) => ({
            id: a.id,
            name: a.name
        })),
        album: {
            id: raw.al.id,
            name: raw.al.name,
            picUrl: raw.al.picUrl
        },
        duration: raw.dt
    }
}

/**
 * 获取歌曲播放的url
 */
const getTrackUrl = async (id: number) => {
    const res = await request.get("song/url", {
        params: { id }
    })
    return res.data[0]?.url || null;
}

export { getTrackDetail, getTrackUrl }