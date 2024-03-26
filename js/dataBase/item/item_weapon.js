export default {
    data: [
        {
            "id": "sword_1",
            "type": 3,
            "stackLimit": 1,
            "name": "Wooden sword",
            "position": "hand",
            "effect": {
                "base_damage": {
                    "min": 1,
                    "max": 3
                },
                "base_attribute": {
                    "str": 1
                },
                "desc": "A sword made out of wood,\noften use for practice."
            },
            "prefix": [],
            "suffix": []
        },
        {
            "id": "knife_1",
            "type": 3,
            "stackLimit": 1,
            "name": "Combat knife",
            "position": "hand",
            "effect": {
                "base_damage": {
                    "min": 1,
                    "max": 3
                },
                "base_attribute": {
                    "str": 2
                },
                "desc": "A small knife for self defense."
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