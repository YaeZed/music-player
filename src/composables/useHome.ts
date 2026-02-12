/**
 * 主页数据管理 Composable
 */
import type { Playlist } from "@/types/entities/playlist";
import type { Album } from "@/types/entities/album";
import type { Artist } from "@/types/entities/track";
import { ref } from "vue";
import { getRecommentPlayList, getTopList } from "@/api/modules/playList";
import { getNewAlbums } from "@/api/modules/aibum";
import { getTopListArtists } from "@/api/modules/artist";

export const useHome = () => {
    const loading = ref(false);
    const recommendPlaylists = ref<Playlist[]>([])
    const newAlbums = ref<Album[]>([])
    const topArtists = ref<Artist[]>([])
    const topCharts = ref<Playlist[]>([])

    /**
   * 加载主页所有数据
   */
    const loadHomeData = async () => {
        try {
            loading.value = true
            console.log("📊 [useHome] Loading home data...");

            // 并行加载所有数据
            const [playlists, albums, allArtists, charts] = await Promise.all([
                // 1.推荐歌单
                getRecommentPlayList(10),

                // 2.新专辑
                getNewAlbums({ area: "ALL", limit: 10 }),

                // 3.热门歌手
                getTopListArtists(null),

                // 4.所有榜单
                getTopList()
            ])

            recommendPlaylists.value = playlists

            newAlbums.value = albums

            // 随机选择6位歌手
            topArtists.value = getRandomArtists(allArtists, 6)

            // 只显示指定的几个榜单
            const topChartIds = [19723756, 180106, 60198, 3812895, 60131];
            topCharts.value = charts.filter((c) => topChartIds.includes(c.id));

            console.log("✅ [useHome] Home data loaded successfully");

        } catch (error) {
            console.error("❌ [useHome] Failed to load home data:", error);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    /**
   * 随机选择歌手
   */
    const getRandomArtists = (artists: Artist[], count: number): Artist[] => {
        const shuffled = [...artists].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    return {
        // State
        loading,
        recommendPlaylists,
        newAlbums,
        topArtists,
        topCharts,

        // Methods
        loadHomeData,
    };

}