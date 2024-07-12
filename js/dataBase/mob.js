import mob_zombie from "./mob/mob_zombie"

                export default {
                    data: [
                        mob_zombie,

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
            