import type { Artist } from "@/types/entities/artist";
import request from "../request";
import type { RawArtist, TopListArtistsResponse } from "@/types/api/artist.type";


/**
 * 获取热门歌手榜
 * @param type - 地区类型：1(华语)/2(欧美)/3(韩国)/4(日本)/null(全部)
 */
export const getTopListArtists = async (type: number | null = null): Promise<Artist[]> => {
    const params: Record<string, any> = {}
    if (type !== null) {
        params.type = type
    }

    const res = await request.get<any, TopListArtistsResponse>("/toplist/artist", {
        params,
    })
    return res.list.artists.map(transformArtist)
}

/**
 * 转换歌手数据为标准格式
 */
const transformArtist = (raw: RawArtist): Artist => {
    return {
        id: raw.id,
        name: raw.name,
        picUrl: raw.picUrl,
        img1v1Url: raw.img1v1Url,
    };
}