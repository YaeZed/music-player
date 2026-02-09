import { usePlayerStore } from "@/stores/modules/player"
import { storeToRefs } from "pinia"

/**
 * 播放器 Composable
 *
 * - 为组件提供简洁的 API（不需要直接操作 Store）
 * - 统一管理 Store 的引用和方法
 * - 方便在多个组件中复用
 */
export const usePlayer = () => {
    const playerStore = usePlayerStore()

    // 使用storeToRefs解构state
    const {
        playing,
        loading,
        currentTrack,
        errorMessage,
        currentTrackName,
        currentArtists,
        currentTime,
        duration,
        progress
    } = storeToRefs(playerStore);

    // 解构方法
    const { playTrack, pause, resume, togglePlay, stop, seekTo } = playerStore;

    return {
        // State（响应式）
        playing,
        loading,
        currentTrack,
        errorMessage,
        currentTrackName,
        currentArtists,
        currentTime,
        duration,
        progress,

        // Actions
        playTrack,
        pause,
        resume,
        togglePlay,
        stop,
        seekTo
    };
}