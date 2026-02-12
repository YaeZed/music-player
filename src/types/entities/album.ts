/**
 * 专辑类型定义
 */

import type { Artist } from "./artist";

/**
 * 专辑信息
 */
export interface Album {
    id: number;
    name: string;
    picUrl: string; // 封面图片
    publishTime: number; // 发布时间（时间戳）
    artist: Artist; // 主要歌手
    artists: Artist[]; // 所有歌手
    type: string; // 类型：EP/Single/专辑
    size: number; // 歌曲数量
}