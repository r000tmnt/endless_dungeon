import i18next from "i18next";
import * as en from '../locale/en.json'
import * as zh from '../locale/zh.json'
import game from "../game";

i18next.init({
    lng: 'en',
    debug: true,
    resources:{
        en: {
            translation: en
        },
        zh: {
            translation: zh
        }
    }
})

// on language change event
i18next.on('languageChanged', (lng) => {
    // Re-render ui elements
    
})

export const t = i18next.t
export const lng = i18next.language
export const changeLanguage = i18next.changeLanguage