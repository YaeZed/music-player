/**
 * 歌曲类型定义
 */
interface Artist {
    id: number;
    name: string;
}

interface Album {
    id: number;
    name: string;
    picUrl: string;
}

interface Track {
    id: number;
    name: string;
    artists: Artist[];
    album: Album;
    duration: number;
}

// 歌词行
interface LyricLine {
    time: number;
    text: string
}
// 歌词数据
interface Lyric {
    lines: LyricLine[]
}

export type { Track, Artist, Album, Lyric, LyricLine }

