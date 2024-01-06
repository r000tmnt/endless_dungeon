export default{
    data: [
        {
            "id": "skill_slash_1",
            "name": "Slash",
            "effects":
            {
                "type": "dmg",
                "base_on_attribute": "str",
                "multiply_as": "solid",
                "base_dmg": 10
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