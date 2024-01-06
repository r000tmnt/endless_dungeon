export default{
    data: [
        {
            "id": "armor_light_1",
            "name": "Rag",
            "type": 4,
            "stackLimit": 1,
            "position": "body",
            "effect":{
                "base_attribute":{
                    "def": 2
                },
                "desc": "A cloth in a poor condition"
            },
            "prefix": [],
            "suffix": []
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