import mob_zombie from "./mob/mob_zombie"

export default{
    data: [
        ...mob_zombie
    ],

    getAll(){
        return this.data
    },

    getOne(id){
        return this.data.find(m => m.id === id)
    },

    search(keyWord){
        return this.data.filter(m => m.name.includes(keyWord))
    }
}