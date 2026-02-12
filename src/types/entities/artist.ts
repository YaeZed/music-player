/**
 * 歌手类型定义
 */

/**
 * 歌手信息
 */
export interface Artist {
    id: number;
    name: string;
    picUrl?: string; // 歌手图片
    img1v1Url?: string; // 方形头像
}