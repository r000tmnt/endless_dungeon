export default class Range {
    constructor(map, tileSize){
        this.map = map
        this.tileSize = tileSize
    }

    draw(ctx, selectableSpace, actionMode){

        // Change the globalCompositeOperation to destination-over so that anything
        // that is drawn on to the canvas from this point on is drawn at the back
        // of what's already on the canvas
        switch(actionMode){
            case 'move':
                if(selectableSpace.length){
                    ctx.save()
                    ctx.globalCompositeOperation = 'destination-over';
                    this.#showMovableSpace(ctx, selectableSpace)
                }
            break;
            case 'attack': case 'skill':
                if(selectableSpace.length){
                    ctx.save()
                    ctx.globalCompositeOperation = 'destination-over';
                    this.#showAttackRange(ctx, selectableSpace)
                }
            break;
        }
    }

    setTileSize(size){
        this.tileSize = size
    }

    // show a range of walkable space
    #showMovableSpace(ctx, walkableSpace){
        for(let layer = 0; layer < walkableSpace.length; layer++){
            for(let block = 0; block < walkableSpace[layer].length; block++){
                const row = walkableSpace[layer][block][0]
                const col = walkableSpace[layer][block][1]
                ctx.fillStyle = 'green';
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

    // show the range of the attack
    #showAttackRange(ctx, attackRange){
        for(let layer = 0; layer < attackRange.length; layer++){
            for(let block = 0; block < attackRange[layer].length; block++){
                const row = attackRange[layer][block][0]
                const col = attackRange[layer][block][1]
                ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
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