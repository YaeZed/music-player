/**
 * 歌词 Composable
 * - 获取和解析歌词
 * - 根据当前播放时间计算应显示的歌词
 */

import { getTrackLyric } from "@/api/modules/track";
import type { Lyric, LyricLine } from "@/types/entities/track"
import { getCurrentLyricIndex, parseLyric } from "@/utils/lyric";
import { computed, ref } from "vue"

const useLyrics = () => {
    // state
    const lyric = ref<Lyric | null>(null);
    const loading = ref(false)
    const error = ref('')

    // getters
    const lines = computed<LyricLine[]>(() => lyric.value?.lines ?? [])
    const hasLyric = computed(() => lines.value.length > 0)

    /**
     * 获取指定时间的歌词索引
     * @param currentTime 
     */
    const getLyricIndex = (currentTime: number): number => {
        return getCurrentLyricIndex(lines.value, currentTime)
    }

    /**
     * 获取指定时间的歌词文本
     * @param currentTime  
     */
    const getCurrentLyric = (currentTime: number): string => {
        const index = getLyricIndex(currentTime)
        if (index && index < lines.value.length) {
            return lines.value[index]!.text
        }
        return ""
    }

    // action
    /**
     * 加载歌词
     * @param trackId - 歌曲id 
     */
    const loadLyric = async (trackId: number) => {
        try {
            loading.value = true;
            error.value = ""
            console.log("📝 [useLyrics] Loading lyric for track:", trackId);

            const lrcString = await getTrackLyric(trackId)
            lyric.value = parseLyric(lrcString)
            console.log(
                "✅ [useLyrics] Lyric loaded, lines:",
                lyric.value.lines.length,
            );

        } catch (err: any) {
            error.value = err.message || "歌词加载失败";
            console.error("❌ [useLyrics] Failed to load lyric:", err);
            lyric.value = null;
        } finally {
            loading.value = false;
        }
    }

    /**
     * 清空歌词
     */
    const clearLyric = () => {
        lyric.value = null;
        error.value = ""
    }

    return {
        lyric,
        loading,
        error,

        lines,
        hasLyric,

        getLyricIndex,
        getCurrentLyric,
        loadLyric,
        clearLyric,
    };
}

export { useLyrics }