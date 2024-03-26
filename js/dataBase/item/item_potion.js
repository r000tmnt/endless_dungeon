import { t } from '../../utils/i18n'

export default{
    data: [
        {
            "id": "potion_health_1",
            "name": t("item.potion_health_1.name"),
            "type": 0,
            "stackLimit": 99,
            "effect":{
                "lv": 1,
                "rare": "N",
                "type": 0,
                "range": 1,
                "target": "hp",
                "amount": 10,
                "desc": t("item.potion_health_1.desc")
            },
            "useCondition": {
                "compare": "lower",
                "target": "maxHp" 
            },
            "prefix": [],
            "suffix": []
        },
        {
            "id": "potion_mana_1",
            "name": t("item.potion_mana_1.name"),
            "type": 0,
            "stackLimit": 99,
            "effect":{
                "lv": 1,
                "rare": "N",
                "type": 0,
                "range": 1,
                "target": "mp",
                "amount": 10,
                "desc": t("item.potion_mana_1.desc")
            },
            "useCondition": {
                "compare": "lower",
                "target": "maxMp" 
            },
            "prefix": [],
            "suffix": []
        },
        {
            "id": "potion_antidote",
            "name": t("item.potion_antidote.name"),
            "type": 0,
            "stackLimit": 99,
            "effect":{
                "lv": 1,
                "rare": "N",
                "type": 0,
                "range": 1,
                "target": "status",
                "amount": 0,
                "desc": t("item.potion_antidote.desc")
            },
            "useCondition": {
                "compare": "equal",
                "target": "Poison" 
            },
            "prefix": [],
            "suffix": []
        },
        {
            "id": "potion_revive",
            "name": t("item.potion_revive.name"),
            "type": 0,
            "stackLimit": 99,
            "effect":{
                "lv": 1,
                "rare": "N",
                "type": 1,
                "range": 1,
                "target": "all",
                "amount": 10,
                "desc": t("item.potion_revive.desc")
            },
            "prefix": [],
            "suffix": []
        }
    ],

    getAll(){
        return this.data
    },

    getOne(id){
        return this.data.find(p => p.id === id)
    },

    search(keyWord){
        return this.data.filter(p => p.name.includes(keyWord))
    }
}