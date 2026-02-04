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
    // ...其他字段
}

export type { Track, Artist, Album }

