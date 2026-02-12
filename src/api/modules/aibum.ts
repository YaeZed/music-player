/**
 * 获取新专辑
 * @param params.area - 地区：ALL(全部)/ZH(华语)/EA(欧美)/KR(韩国)/JP(日本)
 * @param params.limit - 数量限制
 */
import request from "../request";
import type { Album } from "@/types/entities/album";
import type { NewAlbumsResponse, RawAlbum } from "@/types/api/aibum.type";
export const getNewAlbums = async (
    params: {
        area?: "ALL" | "ZH" | "EA" | "KR" | "JP";
        limit?: number;
    } = {},
): Promise<Album[]> => {
    const res = await request.get<any, NewAlbumsResponse>("/album/new", {
        params: {
            area: params.area || "ALL",
            limit: params.limit || 30,
        },
    });

    return res.albums.map(transformAlbum);
}

/**
 * 转换专辑数据为标准格式
 */
const transformAlbum = (raw: RawAlbum): Album => {
    return {
        id: raw.id,
        name: raw.name,
        picUrl: raw.picUrl,
        publishTime: raw.publishTime,
        artist: {
            id: raw.artist.id,
            name: raw.artist.name,
        },
        artists: raw.artists.map((a) => ({
            id: a.id,
            name: a.name,
        })),
        type: raw.type,
        size: raw.size,
    };
}


