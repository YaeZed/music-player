/**
 * 播放器store
 * - 管理播放器全局状态
 * - 协调api和AudioService
 * - 提供播放，暂停等方法
 */

import { getTrackDetail, getTrackUrl } from "@/api/modules/track";
import { audioService } from "@/services/AudioService";
import type { Track } from "@/types/entities/track";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const usePlayerStore = defineStore("player", () => {
    // state
    const playing = ref(false) // 播放状态
    const loading = ref(false) // 加载状态
    const currentTrack = ref<Track | null>(null);// 当前歌曲
    const errorMessage = ref("")// 错误信息
    const currentTime = ref(0) // 当前播放时间（秒）
    const duration = ref(0) // 歌曲时长

    //getters
    // 当前歌曲id
    const currentTrackId = computed(() => currentTrack.value?.id ?? null)

    // 当前歌曲名称
    const currentTrackName = computed(() => currentTrack.value?.name ?? '未播放')

    // 当前歌手名字
    const currentArtists = computed(() => {
        if (!currentTrack.value) return ""
        return currentTrack.value.artists.map((a) => a.name).join(" / ");
    })

    // 进度百分比
    const progress = computed(() => {
        if (duration.value === 0) return 0
        return (currentTime.value / duration.value) * 100
    })

    //actions
    /**
     * 播放指定歌曲
     * @param trackId - 歌曲id
     */
    const playTrack = async (trackId: number) => {
        // ID 守卫：如果是同一首歌，直接处理播放/暂停逻辑，不要重新请求 API
        if (trackId === currentTrackId.value && currentTrack.value) {
            console.log("ℹ️ [PlayerStore] Same track, toggling play state");
            togglePlay();
            return;
        }
        try {
            loading.value = true
            errorMessage.value = "";

            console.log("📀 [PlayerStore] Fetching track:", trackId);

            // 1.获取歌曲详情
            const tracks = await getTrackDetail(trackId);

            if (tracks.length > 0) {
                // 新建实例，闭包
                const track = tracks[0]
                if (track) {
                    currentTrack.value = track
                    duration.value = track.duration / 1000
                    // 2.获取播放url
                    const url = await getTrackUrl(track.id)
                    console.log("✅ [PlayerStore] Play URL loaded:", url);
                    // 3.播放音频
                    await audioService.play(url)
                    playing.value = true
                    console.log("🎉 [PlayerStore] Now playing:", track.name);
                    // 4.监听进度
                    audioService.startProgressTracking((current, dur) => {
                        currentTime.value = current
                        duration.value = dur
                    })
                }
            }
        } catch (error: any) {
            const message = error.message || "播放失败";
            errorMessage.value = message;
            console.error("❌ [PlayerStore] Play failed:", message);
            playing.value = false;
            throw error;
        } finally {
            loading.value = false;
        }
    }
    /**
     * 暂停
     */
    const pause = () => {
        audioService.pause();
        audioService.stopProgressTracking()
        playing.value = false
        console.log("⏸️ [PlayerStore] Paused");

    }
    /**
    * 恢复播放
    */
    const resume = () => {
        audioService.resume();
        audioService.startProgressTracking((current, dur) => {
            currentTime.value = current
            duration.value = dur
        })
        playing.value = true;
        console.log("▶️ [PlayerStore] Resumed");
    }
    /**
     * 切换播放/暂停
     */
    const togglePlay = () => {
        if (playing.value) {
            pause();
        } else {
            resume();
        }
    }
    /**
     * 停止播放
     */
    const stop = () => {
        audioService.stop();
        audioService.stopProgressTracking()
        playing.value = false;
        currentTime.value = 0;
        console.log("⏹️ [PlayerStore] Stopped");
    }

    /**
  * 跳转到指定时间
  * @param time - 时间（秒）
  */
    function seekTo(time: number) {
        audioService.seek(time);
        currentTime.value = time;
        console.log("⏩ [PlayerStore] Seeked to:", time);
    }

    return {
        playing,
        loading,
        currentTrack,
        errorMessage,
        currentTime,
        duration,

        currentTrackId,
        currentTrackName,
        currentArtists,
        progress,

        playTrack,
        pause,
        resume,
        togglePlay,
        stop,
        seekTo
    };
})