import { createI18n } from "vue-i18n";
import en from "./lang/en";
import zhCN from "./lang/zh-CN";
import zhTW from "./lang/zh-TW";
import tr from "./lang/tr";

// 从localStorage或默认值读取初始语言
const savedLang = localStorage.getItem('lang') ?? 'zh-CN'

const i18n = createI18n({
    legacy: false,
    locale: savedLang,
    fallbackLocale: 'en',// 找不到翻译时回退到英文
    messages: {
        en,
        'zh-CN': zhCN,
        'zh-TW': zhTW,
        tr,
    },
    silentTranslationWarn: true,
})

export default i18n