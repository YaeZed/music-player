/**
 * API 原始响应 - 专辑
 */
interface RawAlbum {
    id: number;
    name: string;
    picUrl: string;
    publishTime: number;
    artist: {
        id: number;
        name: string;
    };
    artists: {
        id: number;
        name: string;
    }[];
    type: string;
    size: number;
}

/**
 * 新专辑 API 响应
 */
interface NewAlbumsResponse {
    code: number;
    albums: RawAlbum[];
}

export type { RawAlbum, NewAlbumsResponse }