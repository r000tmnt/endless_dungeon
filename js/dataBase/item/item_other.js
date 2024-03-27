export default{
    data: [
        {
            "id": "currency_1",
            "name": "Gold coin",
            "stackLimit": 5000,
            "type": 1,
            "effect": {
                "desc": "The coin to exchange something."
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