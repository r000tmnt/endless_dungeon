export default{
    data: [
        {
            "type": 0,
            "category": "sword"
        },
        {
            "type": 1,
            "category": "kneif"
        },
        {
            "type": 2,
            "category": "wand"
        },
        {
            "type": 3,
            "category": "staff"
        },
        {
            "type": 4,
            "category": "axe"
        },
        {
            "type": 5,
            "category": "bow"
        },
        {
            "type": 6,
            "category": "gun"
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