import tutorial_1 from './level/tutorial_1_zh.json'
import ui from './ui/ui_zh.json'
import potion from './item/item_potion_zh.json'
import weapon from './item/item_weapon_zh.json'
import armor from './item/item_armor_zh.json'
import material from './item/item_material_zh.json'
import key from './item/item_key_zh.json'
import other from './item/item_other_zh.json'
import skill_sword from './skill/skill_sword_zh.json'
import skill_status from './skill/skill_status_zh.json'
import class_fighter from './class/class_fighter_zh.json'
import mob from './mob/mob_zombie_zh.json'

export default {
    job: {
        ...class_fighter
    },
    mob,
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
        ...skill_status,
    },
    "demo": "這裡是 DEMO 的終點。 感謝你的遊玩",
    "loading": "讀取中...",
    "tap": "點擊螢幕繼續",
    "back": "返回"
}