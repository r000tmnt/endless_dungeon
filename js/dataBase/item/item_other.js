export default{
    data: [
        {
            "id": "currency_1",
            "name": "Gold",
            "stackLimit": 5000,
            "type": 1
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