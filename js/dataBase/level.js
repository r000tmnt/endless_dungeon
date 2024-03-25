// import tutorial from './level/p-1-1'

/**
 * Place the conversation event at the beginning of the event array and state the trigger value as "auto"
 * Other event like drop item or character interation are place after conversation event
 */
export default{
    data: [
        // {...tutorial},
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
    },

    /**
     * Loading level data from the pointed path
     * @param {string} id - The id of the level 
     */
    async load(id){
        const index = this.data.findIndex(k => k.id === id)
        const levelData = await import(`./level/${id}`)

        console.log('level data:>>> ', levelData)

        if(index >= 0){
            this.data[index] = {...levelData.default}
        }else{
            this.data.push({...levelData.default})
        }

        console.log('level :>>>', this.data)
    }
}