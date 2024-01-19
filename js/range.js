export default class Range {
    constructor(map, tileSize){
        this.map = map
        this.tileSize = tileSize
    }

    draw(ctx, selectableSpace, actionMode, skillType = ''){

        // Change the globalCompositeOperation to destination-over so that anything
        // that is drawn on to the canvas from this point on is drawn at the back
        // of what's already on the canvas
        if(selectableSpace.length){
            ctx.save()
            ctx.globalCompositeOperation = 'destination-over';     
            
            switch(actionMode){
                case 'move':
                    ctx.fillStyle = 'green'
                break;
                case 'attack': case 'skill':
                    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
                    
                    if(skillType === 'defense'){
                        ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'
                    }
                break;
                case 'item':
                    ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'
                    console.log('action item :>>>', selectableSpace)
                break;
                case 'search':
                    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'
                break;
            }   
            
            this.#showSelectableSpace(ctx, selectableSpace)
        }
    }

    setTileSize(size){
        this.tileSize = size
    }

    // show a range of walkable space
    #showSelectableSpace(ctx, selectableSpace){
        for(let layer = 0; layer < selectableSpace.length; layer++){
            for(let block = 0; block < selectableSpace[layer].length; block++){
                const row = selectableSpace[layer][block][0]
                const col = selectableSpace[layer][block][1]

                ctx.fillRect( // x, y, width, height
                    col * this.tileSize,
                    row * this.tileSize,
                    this.tileSize,
                    this.tileSize
                );               
            }
        }
        ctx.restore()
    }
}
