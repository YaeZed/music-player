/**
 * 设置 Store
 * 管理应用设置，包括主题切换
 */

import { defineStore } from "pinia";
import { ref, watch } from "vue";
import i18n from "@/locale"; // 假设你已有 i18n 实例

export const useSettingsStore = defineStore('settings', () => {
    // --- 状态 (State) ---

    const theme = ref<'light' | 'dark'>(localStorage.getItem("theme") as any ?? "light")
    const lang = ref<string>(localStorage.getItem('lang') ?? 'zh-CN')

    // Apple Music 显示开关：直接定义，默认开启
    const showPlaylistsByAppleMusic = ref<boolean>(
        localStorage.getItem('showPlaylistsByAppleMusic') === 'false' ? false : true
    )

    // --- 逻辑 (Actions) ---

    const initTheme = () => {
        const savedTheme = localStorage.getItem("theme") as "light" | "dark";
        const targetTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light");
        theme.value = targetTheme;
        applyTheme(targetTheme);
    }

    const applyTheme = (newTheme: 'light' | 'dark') => {
        document.documentElement.setAttribute('data-theme', newTheme);
    }

    const toggleTheme = () => {
        theme.value = theme.value === "light" ? "dark" : "light";
    }

    const setLang = (newLang: 'zh-CN' | 'en' | 'zh-TW' | 'tr') => {
        lang.value = newLang;
        // 注意：i18n v9+ 语法的更新
        (i18n.global.locale as any).value = newLang;
        localStorage.setItem('lang', newLang);
    }

    // --- 监听状态自动持久化 (Watchers) ---

    // 监听 Apple Music 显隐设置
    watch(showPlaylistsByAppleMusic, (newValue) => {
        localStorage.setItem('showPlaylistsByAppleMusic', String(newValue));
    })

    // 监听主题并应用渲染
    watch(theme, (newTheme) => {
        localStorage.setItem("theme", newTheme);
        applyTheme(newTheme);
    })

    return {
        theme,
        lang,
        showPlaylistsByAppleMusic, // 导出供组件使用
        initTheme,
        toggleTheme,
        setLang
    };
})
