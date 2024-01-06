export default{
    data: [
        {
            "id": "mob_zombie_1",
            "name": "Zombie",
            "prefer_attributes": [ "str" ],
            "base_attribute": {
                "hp": 10, 
                "mp": 3,
                "maxHp": 10, 
                "maxMp": 3,  
                "str": 7, 
                "def": 5, 
                "int": 2,
                "spd": 2, 
                "ap": 2,
                "lck": 2,
                "maxAp": 2,
                "moveSpeed": 1,
                "sight": 3
            },
            "base_skills": [],
            "drop": [
                {
                    "name": "Gold",
                    "amount": 1,
                    "rate": 70
                },
                {
                    "name": "Rotten meat",
                    "amount": 1,
                    "rate": 50
                },
                {
                    "name": "key",
                    "amount": 1,
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