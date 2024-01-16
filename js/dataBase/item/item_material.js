export default{
    data: [
        {
            "id": "material_meat_2",
            "name": "Rotten meat",
            "stackLimit": 10,
            "type": 2
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