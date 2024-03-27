export default{
    data: [
        {
            "id": "key_dark_1",
            "name": "Key of silence",
            "stackLimit": 99,
            "type": 6,
            "effect":{
                "lv": 1,
                "rare": "N",
                "enemy_number": 3,
                "elite_rate": 50,
                "item_drop_modify": "",
                "desc": "There will be less enemy in the field"
            }
        }
    ],

    getAll(){
        return this.data
    },

    getOne(id){
        return this.data.find(k => k.id === id)
    },

    search(keyWord){
        return this.data.filter(k => k.name.includes(keyWord))
    }
}