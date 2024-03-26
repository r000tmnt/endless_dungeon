import i18next from "i18next";
import en from '../locale/en.js'
import zh from '../locale/zh.js'

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

export const t = i18next.t
export const i18n = i18next
export const changeLanguage = i18next.changeLanguage