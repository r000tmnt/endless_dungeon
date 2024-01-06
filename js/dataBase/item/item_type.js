export default{
    data: [
        {
            "type": 0,
            "category": "potion"
        },
        {
            "type": 1,
            "category": "currency"
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

    getOne(type){
        return this.data.find(t => t.type === type)
    },

    search(keyWord){
        return this.data.filter(t => t.category.includes(keyWord))
    }
}