export default {
                data: [
    {
        "id": "material_meat_2",
        "name": "Rotten meat",
        "stackLimit": 10,
        "type": 2,
        "effect": {
            "type": 2,
            "target": "status",
            "rare": "N",
            "status": "Poison",
            "amount": 5,
            "rate": 70,
            "desc": "Please don't eat it."
        }
    }
],

                getAll(){
                    return this.data
                },

                getOne(id){
                    return this.data.find(a => a.id === id)
                },

                search(keyWord){
                    return this.data.filter(a => a.name.includes(keyWord))
                }
            }
            