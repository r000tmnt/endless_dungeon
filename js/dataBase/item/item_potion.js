export default{
    data: [
        {
            "id": "potion_health_1",
            "name": "Health potion",
            "type": 0,
            "stackLimit": 99,
            "effect":{
                "lv": 1,
                "rare": "N",
                "type": 0,
                "target": "hp",
                "amount": 10,
                "desc": "Restore 10 points of health."
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
                "lv": 1,
                "rare": "N",
                "type": 0,
                "target": "mp",
                "amount": 10,
                "desc": "Restore 10 points of mana."
            },
            "prefix": [],
            "suffix": []
        },
        {
            "id": "potion_antidote",
            "name": "Antidote",
            "type": 0,
            "stackLimit": 99,
            "effect":{
                "lv": 1,
                "rare": "N",
                "type": 0,
                "target": "status",
                "amount": 0,
                "desc": "Remove the poison."
            },
            "prefix": [],
            "suffix": []
        },
        {
            "id": "potion_revive",
            "name": "Candle of soul",
            "type": 0,
            "stackLimit": 99,
            "effect":{
                "lv": 1,
                "rare": "N",
                "type": 1,
                "target": "all",
                "amount": 10,
                "desc": "Revive the character with 10% of health."
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