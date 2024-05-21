import class_fighter from "./class/class_fighter"

export default {
    data: [
        ...class_fighter
    ],

    getAll(){
        return this.data
    },

    getOne(id){
        return this.data.find(c => c.id === id)
    },

    search(keyWord){
        return this.data.filter(c => c.name.includes(keyWord))
    }
}