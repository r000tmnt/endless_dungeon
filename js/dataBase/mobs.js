export default{
    data: [
        {
            "id": "mob_zombie_1",
            "name": "Zombie",
            "prefer_attributes": [ "str" ],
            "prefer_action": "attack",
            "prefer_skill_type": "none",
            "base_attribute": {
                "hp": 10, 
                "mp": 3,
                "maxHp": 10, 
                "maxMp": 3,  
                "str": 7, 
                "def": 5, 
                "int": 2,
                "spd": 2, 
                "spi": 2,
                "ap": 2,
                "lck": 2,
                "maxAp": 2,
                "moveSpeed": 1,
                "sight": 3
            },
            "skill": [
                "poison_1"
            ],
            "drop": [
                {
                    "id": "currency_1",
                    "amount": 1,
                    "type": 1,
                    "rate": 70
                },
                {
                    "id": "material_meat_2",
                    "amount": 1,
                    "type": 2,
                    "rate": 50
                },
                {
                    "id": "key_dark_1",
                    "amount": 1,
                    "type": 6,
                    "rate": 100
                }
            ]
        }
    ],

    getAll(){
        return this.data
    },

    getOne(id){
        return this.data.find(m => m.id === id)
    },

    search(keyWord){
        return this.data.filter(m => m.name.includes(keyWord))
    }
}