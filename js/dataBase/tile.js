export default {
    data: [
        { 
            type: 0,
            name: 'ground',
            walkable: true
         },
        {
            type: 1, 
            name: 'wall',
            walkable: false
        },
        {
            type: 2, 
            name: 'player',
            walkable: false
         },
        {
            type: 3, 
            name: 'enemy',
            walkable: false
         },
        {
            type: 4, 
            name: 'item',
            walkable: true
         },
    ],

    getOne(type){
        const tile = this.data.find(t => t.type === type)
        
        return tile !== undefined? tile.walkable : false
    }
}