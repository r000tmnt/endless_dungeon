// class - 物件創建的模板
export default class TileMap {
    //付值給實體的物件
    constructor(tileSize){
        this.tileSize = tileSize;
        this.wall = this.#image("wall.png")
        this.player = this.#image("fighter.png")
        this.enimy = this.#image("zombie.png")
    }

    #image(fileName){
        const img = new Image();
        img.src = `images/${fileName}`;
        return img
    }

    // 地圖樣式的參考列表
    // [{ type: 0; walkable: false }]
    // 0 - ground
    // 1 - wall
    // 2 - player
    // 3 - zombie
    map = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 2, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 3, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]

    type = {
        0: { walkable: false },
        1: { walkable: false },
        2: { walkable: false },
        3: { walkable: false },
    }

    //負責渲染於畫面的函式
    draw(canvas, ctx, walkableSpace, characterPosition){
        // console.log(walkableSpace)
        this.#setCanvasSize(canvas);
        this.#clearCanvas(canvas, ctx)
        this.#drawMap(ctx, 0);

        if(walkableSpace !== undefined && walkableSpace.length){
            this.#showMovableSpace(ctx, walkableSpace, characterPosition)
        }
    }

    #setCanvasSize(canvas){
        canvas.height = this.map.length * this.tileSize;
        canvas.width = this.map[0].length * this.tileSize;
    }

    #clearCanvas(canvas, ctx){
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    #drawMap(ctx, row){
        let currentRow = row

        for(let column = 0; column < this.map[currentRow].length; column++){
            const tile = this.map[currentRow][column];
            let img = null

            switch(tile){
                case 1:
                    img = this.wall;
                break;
                case 2:
                    img = this.player;
                break;
                case 3:
                    img = this.enimy;
                break;
                default:
                break;
            }

            if(img !== null) ctx.drawImage(img, column * this.tileSize, currentRow * this.tileSize, this.tileSize, this.tileSize)

            if(column === (this.map[currentRow].length - 1) && currentRow < (this.map.length - 1) ){
                currentRow += 1
                this.#drawMap(ctx, currentRow)
            }
        }
    }

    // show a the walkable space
    #showMovableSpace(ctx, walkableSpace, characterPosition){
        // console.log(characterPosition)

        for(let layer = 0; layer < walkableSpace.length; layer++){

            for(let block = 0; block < walkableSpace[layer].length; block++){
                if(walkableSpace[layer][block].length){
                    const row = walkableSpace[layer][block][1]
                    const col = walkableSpace[layer][block][0]
                    if(this.map[row][col] === 0){
                        ctx.fillStyle = 'green';
                        ctx.fillRect(
                            walkableSpace[layer][block][0] * this.tileSize,
                            walkableSpace[layer][block][1] * this.tileSize,
                            this.tileSize,
                            this.tileSize
                        );                        
                    }
                }                
            }


        } 
    }
}