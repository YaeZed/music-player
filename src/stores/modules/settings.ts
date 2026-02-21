/**
 * 设置 Store
 * 管理应用设置，包括主题切换
 */

import i18n from "@/locale";
import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const useSettingsStore = defineStore('settings', () => {
    // 主题
    const theme = ref<'light' | 'dark'>("light")
    // 语言
    const lang = ref<string>(localStorage.getItem('lang') ?? 'zh-CN')

    // actions
    /**
    * 初始化主题
   * 从 localStorage 读取用户上次选择的主题
   */
    const initTheme = () => {
        // 1.从localStorage中读取
        const savedTheme = localStorage.getItem("theme") as "light" | 'dark';

        // 2.如果有保存的主题，使用保存的，否则使用系统偏好
        if (savedTheme) {
            theme.value = savedTheme
        } else {
            // 检查系统偏好
            const prefersDark = window.matchMedia(
                '(prefers-color-scheme: dark)'
            ).matches;
            theme.value = prefersDark ? "dark" : "light";

            // 3.应用主题
            applyTheme(theme.value)
            console.log(`🎨 [Settings] Theme initialized: ${theme.value}`);
        }
    }

    /**
   * 应用主题到 DOM
   */
    const applyTheme = (newThme: 'light' | 'dark') => {
        //  获取文档的根元素，也就是 <html> 标签
        document.documentElement.setAttribute('data-theme', newThme)
    }

    /**
   * 切换主题
   */
    const toggleTheme = () => {
        theme.value = theme.value === "light" ? "dark" : "light"
        console.log(`🎨 [Settings] Theme toggled to: ${theme.value}`);
    }

    // 监听主题变化，自动保存并应用
    watch(theme, (newThme) => {
        localStorage.setItem("theme", newThme)
        applyTheme(newThme)
    })

    // 设置语言
    const setLang = (newLang: 'zh-CN' | 'en' | 'zh-TW' | 'tr'
    ) => {
        lang.value = newLang
        i18n.global.locale.value = newLang // 同步切换i18n语言
        localStorage.setItem('lang', newLang)
    }

    return {
        theme,
        lang,
        initTheme,
        toggleTheme,
        setLang
    };
})