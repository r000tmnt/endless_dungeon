import { t } from '../../utils/i18n'

export default {
    data: [
        {
            "id": "sword_1",
            "type": 3,
            "stackLimit": 1,
            "name": t("item.sword_1.name"),
            "position": "hand",
            "effect": {
                "base_damage": {
                    "min": 1,
                    "max": 3
                },
                "base_attribute": {
                    "str": 1
                },
                "desc": t("item.sword_1.desc")
            },
            "prefix": [],
            "suffix": []
        },
        {
            "id": "knife_1",
            "type": 3,
            "stackLimit": 1,
            "name": t("item.knife_1.name"),
            "position": "hand",
            "effect": {
                "base_damage": {
                    "min": 1,
                    "max": 3
                },
                "base_attribute": {
                    "str": 2
                },
                "desc": t("item.knife_1.desc")
            },
            "prefix": [],
            "suffix": []
        }
    ],

    getAll(){
        return this.data
    },

    getOne(id){
        return this.data.find(w => w.id === id)
    },

    search(keyWord){
        return this.data.filter(w => w.name.includes(keyWord))
    }
}