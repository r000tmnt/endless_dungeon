import tutorial_1 from './level/p-1-1-zh'
import ui from './ui/ui_zh'
import potion from './item/item_potion_zh'
import weapon from './item/item_weapon_zh'
import armor from './item/item_armor_zh'
import material from './item/item_material_zh'
import key from './item/item_key_zh'
import other from './item/item_other_zh'
import skill_sword from './skill/sword_zh'
import buff from './skill/buff_zh'
import debuff from './skill/debuff_zh'

export default {
    tutorial_1,
    ui,
    "item": {
        ...potion,
        ...weapon,
        ...armor,
        ...material,
        ...key,
        ...other
    },
    "skill":{
        ...skill_sword,
        ...buff,
        ...debuff
    },
    "demo": "這裡是 DEMO 的終點。 感謝你的遊玩",
    "loading": "讀取中...",
    "tap": "點擊螢幕繼續",
    "back": "返回"
}