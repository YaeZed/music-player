/**
 * 歌单类型定义
 */

/**
 * 歌单创建者
 */
interface PlaylistCreator {
    userId: number;
    nickname: string;
    avatarUrl?: string
}

/**
 * 歌单基本信息
 */
interface Playlist {
    id: number;
    name: string;
    coverImgUrl: string; // 封面图片
    picUrl: string;
    playCount?: number; // 播放次数
    trackCount?: number; // 歌曲数量
    creator?: PlaylistCreator; // 创建者
    copywriter?: string; // 文案（推荐语）
    updateFrequency?: string; // 更新频率（如"每日更新"）
    description?: string; // 描述
}

export type { Playlist, PlaylistCreator }