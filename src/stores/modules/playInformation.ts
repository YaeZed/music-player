/**
 * 播放信息store
 */

import { defineStore } from "pinia"
import { ref } from "vue"
import { getPersonalFm } from "@/api/modules/fm"
import type { Track } from "@/types/entities/track"

export const usePlayInformation = defineStore("playInformation", () => {
    const _isPersonalFM = ref(false)// 是否是私人FM模式
    const _personalFMTrack = ref<Track>()// 当前播放的私人FM歌曲
    const _personalFMNextTrack = ref<Track>()// 下一首私人FM歌曲

    const getPersonalFM = async () => {
        const result = await getPersonalFm()
        _personalFMTrack.value = result[0]
        _personalFMNextTrack.value = result[1]
        return _personalFMTrack.value
    }

    return {
        _isPersonalFM,
        _personalFMTrack,
        _personalFMNextTrack,
        getPersonalFM
    }
})