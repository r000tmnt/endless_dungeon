export default {
                data: [],

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
            