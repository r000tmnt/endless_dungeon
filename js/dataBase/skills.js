import skill_sword from "./skill/skill_sword"
import skill_status from "./skill/skill_status"

export default{
    data: [
        ...skill_sword,
        ...skill_status
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