import i18next from "i18next";
import * as en from '../locale/en.json'
import * as zh from '../locale/zh.json'

export default i18next.init({
    lag: 'en',
    debug: true,
    resources:{
        en: en,
        zh: zh
    }
})