export default {
    data: [
        {
            "id": "class_fighter_1",
            "name": "Fighter",
            "prefer_attributes": [ "str", "def" ],
            "base_attribute": {
                "hp": 15, 
                "mp": 10, 
                "maxHp": 15, 
                "maxMp": 10, 
                "str": 10, 
                "def": 7, 
                "int": 5,
                "spd": 5, 
                "ap": 3,
                "lck": 5,
                "maxAp": 3,
                "moveSpeed": 3,
                "sight": 5
            },
            "base_skills": [],
            "bag": [
                {
                    "id": "sword_1",
                    "type": 3,
                    "amount": 1
                },
                {
                    "id": "armor_light_1",
                    "type": 4,
                    "amount": 1
                },
                {
                    "id": "potion_health_1",
                    "type": 0,
                    "amount": 1
                }
            ]
        }
    ],

    getAll(){
        return this.data
    },

    getOne(id){
        return this.data.find(c => c.id === id)
    },

    search(keyWord){
        return this.data.filter(c => c.name.includes(keyWord))
    }
}