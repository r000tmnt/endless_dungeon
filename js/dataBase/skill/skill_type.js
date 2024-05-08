export default{
    data: [
        {
            "type": 0,
            "category": "none"
        },
        {
            "type": 1,
            "category": "sword"
        },
        {
            "type": 2,
            "category": "kneif"
        },
        {
            "type": 3,
            "category": "wand"
        },
        {
            "type": 4,
            "category": "staff"
        },
        {
            "type": 5,
            "category": "axe"
        },
        {
            "type": 6,
            "category": "bow"
        },
        {
            "type": 7,
            "category": "gun"
        },
        {
            "type": 8,
            "category": "status"
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