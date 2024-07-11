export default {
                data: [
    {
        "type": 0,
        "category": "potion"
    },
    {
        "type": 1,
        "category": "other"
    },
    {
        "type": 2,
        "category": "material"
    },
    {
        "type": 3,
        "category": "weapon"
    },
    {
        "type": 4,
        "category": "armor"
    },
    {
        "type": 5,
        "category": "accessory"
    },
    {
        "type": 6,
        "category": "key"
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
            