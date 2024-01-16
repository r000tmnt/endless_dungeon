export default class Grid {
    constructor(map, tileSize, pointedBlock){
        this.map = map
        this.tileSize = tileSize
        this.pointedBlock = pointedBlock
    }

    draw(ctx){
        for(let layer = 0; layer < this.map.length; layer++){
            for(let block = 0; block < this.map[layer].length; block++){
                ctx.strokeStyle = "rgba(211, 211, 211, .7)";
                ctx.strokeRect(
                    block * this.tileSize,
                    layer * this.tileSize,
                    this.tileSize,
                    this.tileSize
                );

                if(this.pointedBlock !== null && Object.entries(this.pointedBlock).length){
                    // Draw border around the pointed block
                    const { row, col } = this.pointedBlock
                    ctx.strokeStyle = "yellow";
                    ctx.strokeRect(
                    col * this.tileSize,
                    row * this.tileSize,
                    this.tileSize,
                    this.tileSize
                    );
                }
            }
        }
    }

    setPointedBlock(pointedBlock){
        this.pointedBlock = pointedBlock
    }

    setTileSize(size){
        this.tileSize = size
    }
}