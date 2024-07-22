import skill_knife from "./skill/skill_knife"
import skill_status from "./skill/skill_status"
import skill_sword from "./skill/skill_sword"


export default {
    data: [
        ...skill_knife,
        ...skill_status,
        ...skill_sword,
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
            