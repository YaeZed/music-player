import { playerService } from "@/services/PlayerService";
import type { Track } from "@/types/entities/track";
import { defineStore } from "pinia";
import { ref } from "vue";

export const usePlayerStore = defineStore("player", () => {
    const playing = ref(false)
    const currentTrack = ref<Track | null>(null)
    const progress = ref(0)

    const playTrack = async (trackId: number) => {
        try {
            const track = await playerService.playTrack(trackId);
            currentTrack.value = track;
            playing.value = true
        } catch (error) {
            console.error("播放失败", error);
            throw error
        }
    }

    const pause = () => {
        playerService.pause();
        playing.value = false
    }

    const resume = () => {
        playerService.resume();
        playing.value = true
    }

    return {
        playing,
        currentTrack,
        progress,
        playTrack,
        pause,
        resume
    }
})