export default{
    data: [
        {
            "id": "potion_health_1",
            "name": "Health potion",
            "type": 0,
            "stackLimit": 99,
            "effect":{
                "rare": "N",
                "type": 0,
                "range": 1,
                "target": "hp",
                "amount": 10,
                "desc": "Restore 10 points of health."
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
            "name": "Mana potion",
            "type": 0,
            "stackLimit": 99,
            "effect":{
                "rare": "N",
                "type": 0,
                "range": 1,
                "target": "mp",
                "amount": 10,
                "desc": "Restore 10 points of mana."
            },
            "useCondition": {
                "compare": "lower",
                "target": "maxMp" 
            },
            "prefix": [],
            "suffix": []
        },
        {
            "id": "potion_status_1",
            "name": "Antidote",
            "type": 0,
            "stackLimit": 99,
            "effect":{
                "rare": "N",
                "type": 0,
                "range": 1,
                "target": "status",
                "amount": 0,
                "desc": "Remove poison"
            },
            "useCondition": {
                "compare": "equal",
                "target": "Poison" 
            },
            "prefix": [],
            "suffix": []
        },
        {
            "id": "potion_revive_1",
            "name": "Candle od soul",
            "type": 0,
            "stackLimit": 99,
            "effect":{
                "rare": "N",
                "type": 1,
                "range": 1,
                "target": "all",
                "amount": 10,
                "desc": "Revive a player with 10% of health points."
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