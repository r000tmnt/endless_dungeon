export default{
    data: [
        {
            "id": "skill_slash_1",
            "name": "Slash",
            "weapon": "sword",
            "type": "offense",
            "cost": {
                "attribute": "mp",
                "value": 3
            },
            "effect":
            {
                "type": "dmg",
                "range": 1,
                "base_on_attribute": "str",
                "multiply_as": "solid",
                "base_number": 10,
                "desc": "A quick and powerful strick with sword"
            }
        },
        {
            "id": "poison_1",
            "name": "Poison bite",
            "weapon": "none",
            "type": "offense",
            "cost": {
                "attribute": "mp",
                "value": 1
            },
            "effect": {
                "type": "status",
                "range": 1,
                "base_on_attribute": "luk",
                "multiply_as": "solid",
                "base_number": 3,
                "status": "Poison",
                "desc": "Bite the enemy. Cause the foe to get poisoned"
            }
        }
    ],

    getAll(){
        return this.data
    },

    getOne(id){
        return this.data.find(s => s.id === id)
    },

    search(keyWord){
        return this.data.filter(s => s.name.includes(keyWord))
    }
}