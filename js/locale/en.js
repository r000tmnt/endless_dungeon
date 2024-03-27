import tutorial_1 from './level/p-1-1-en'
import ui from './ui/ui_en'
import potion from './item/item_potion_en'
import weapon from './item/item_weapon_en'
import armor from './item/item_armor_en'
import material from './item/item_material_en'
import key from './item/item_key_en'
import other from './item/item_other_en'
import skill_sword from './skill/sword_en'
import buff from './skill/buff_en'
import debuff from './skill/debuff_en'
import job from './class/class_en'

export default {
    tutorial_1,
    ui,
    job,
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
    "demo": "This is the end of the demo.\nThank you for playing the game.",
    "loading": "Loading...",
    "tap": "TAP TO CONTINUE",
    "back": "Back"
}