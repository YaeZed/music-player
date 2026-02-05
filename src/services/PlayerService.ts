import { getTrackDetail, getTrackUrl } from "@/api/modules/track";
import type { Track } from "@/types/entities/track";
import { audioService } from "./AudioService";

export class PlayerService {
    /**
     * 播放指定歌曲
     */
    async playTrack(trackId: number): Promise<Track> {
        // 1.获取歌曲详情
        const [track] = await getTrackDetail(trackId);

        if (!track) {
            throw new Error("找不到该歌曲")
        }

        // 2.获取播放的url
        const url = await getTrackUrl(trackId);
        if (!url) {
            throw new Error("无法获取播放链接")
        }

        // 3.播放音频
        await audioService.play(url);

        return track;
    }

    pause(): void {
        audioService.pause();
    }
    resume(): void {
        audioService.resume();
    }
}

export const playerService = new PlayerService();