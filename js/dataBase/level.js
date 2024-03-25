import tutorial from './level/p-1-1'

/**
 * Place the conversation event at the beginning of the event array and state the trigger value as "auto"
 * Other event like drop item or character interation are place after conversation event
 */
export default{
    data: [
        {...tutorial},
    ],

    getAll(){
        return this.data
    },

    getOne(id){
        return this.data.find(k => k.id === id)
    },

    search(keyWord){
        return this.data.filter(k => k.name.includes(keyWord))
    },

    getTile(id, row, col){
        const map = this.data.find(l => l.id === id).map

        return map[row][col]
    }
}