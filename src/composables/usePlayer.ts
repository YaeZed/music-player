/**
 * 播放器 Composable
 * 为组件提供简洁的播放器api
 */

import { usePlayerStore } from "@/stores/modules/player"
import { storeToRefs } from "pinia";

export const usePlayer = () => {
    const playerStore = usePlayerStore();

    // 解构状态
    const { playing, currentTrack, progress } = storeToRefs(playerStore)

    // 方法
    const { playTrack, pause, resume } = playerStore;

    return {
        playing,
        currentTrack,
        progress,
        play: playTrack,
        pause,
        resume
    }
}

