import request from "../request";
import type { FMResponse, FMTrack } from "@/types/api/fm.type";
import type { Track } from "@/types/entities/track";

/**
 * 获取私人 FM
 * @returns {Promise<Track[]>} 返回标准化后的歌曲列表
 */
export const getPersonalFm = async (): Promise<Track[]> => {
    const res = await request.get<any, FMResponse>("/personal_fm", {
        params: { timestamp: Date.now() },
    });

    return res.data.map(transformFMTrack);
};

/**
 * 将 FMTrack (API 原始格式) 转换为通用的 Track 类型 
 */
const transformFMTrack = (raw: FMTrack): Track => {
    return {
        id: raw.id,
        name: raw.name,
        artists: raw.artists.map((a) => ({
            id: a.id,
            name: a.name,
        })),
        album: {
            id: raw.album.id,
            name: raw.album.name,
            picUrl: raw.album.picUrl,
        },
        duration: raw.duration,
    };
};
