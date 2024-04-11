export default{
    data: [
        {
            "id": "material_meat_2",
            "name": "Rotten meat",
            "stackLimit": 10,
            "type": 2,
            "effect": {
                "lv": 1,
                "type": 2,
                "target": "status",
                "status": "Poison",
                "amount": 5,
                "rate": 70,
                "desc": "Please don't eat it."
            }
        },
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