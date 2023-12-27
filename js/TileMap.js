import Character from "./Character.js";

// class - 物件創建的模板
export default class TileMap {
    //付值給實體的物件
    constructor(tileSize){
        this.tileSize = tileSize;
        this.wall = this.#image("wall.png")
        // this.player = this.#image("fighter.png")
        // this.enemy = this.#image("zombie.png")
    }

    #image(fileName){
        const img = new Image();
        img.src = `assets/images/env/${fileName}`;
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
    draw(canvas, ctx, walkableSpace){
        // console.log(walkableSpace)
        this.#setCanvasSize(canvas);
        this.#clearCanvas(canvas, ctx)
        this.#drawMap(ctx, 0);

        if(walkableSpace !== undefined && walkableSpace.length){
            this.#showMovableSpace(ctx, walkableSpace)
        }
    }

    #setCanvasSize(canvas){
        canvas.height = this.map.length * this.tileSize;
        canvas.width = this.map[0].length * this.tileSize;
    }

    #clearCanvas(canvas, ctx){
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height); // x, y, width, height
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
                    // img = this.player;
                    
                break;
                case 3:
                    // img = this.enemy;
                    this.map[currentRow][column] = 0
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

    // Get the player position on the canvas
    getPlayer(velocity){

        for(let row=0; row < this.map.length; row++){
            for(let column = 0; column < this.map[row].length; column++){
                const tile = this.map[row][column];

                if(tile === 2){
                    this.map[row][column] = 0

                    const attributes = {
                        name: 'Player', 
                        class: 'class_fighter_1',
                    }
                    
                    // Create a player character
                    // x, y, tile size, velocity, attributes, tile map
                    return new Character(
                        column * this.tileSize, 
                        row * this.tileSize, 
                        this.tileSize, 
                        velocity,
                        tile,
                        attributes, 
                        this.map
                    )
                }
            }            
        }

    }
    
    // Get the enemy position on the canvas
    getEnemy(velocity){

        for(let row=0; row < this.map.length; row++){
            for(let column = 0; column < this.map[row].length; column++){
                const tile = this.map[row][column];

                if(tile === 3){
                    this.map[row][column] = 0

                    const attributes = {
                        name: 'Zombie', 
                        class: 'mob_zombie_1',
                    }
                    
                    // Create a player character
                    // x, y, tile size, velocity, attributes, tile map
                    return new Character(
                        column * this.tileSize, 
                        row * this.tileSize, 
                        this.tileSize, 
                        velocity,
                        tile,
                        attributes, 
                        this.map
                    )
                }
            }            
        }

    }

    // show a the walkable space
    #showMovableSpace(ctx, walkableSpace){

        for(let layer = 0; layer < walkableSpace.length; layer++){

            for(let block = 0; block < walkableSpace[layer].length; block++){
                if(walkableSpace[layer][block].length){
                    const row = walkableSpace[layer][block][0]
                    const col = walkableSpace[layer][block][1]
                    if(this.map[row][col] === 0){
                        ctx.fillStyle = 'green';
                        ctx.fillRect( // x, y, width, height
                            col * this.tileSize,
                            row * this.tileSize,
                            this.tileSize,
                            this.tileSize
                        );                        
                    }
                }                
            }


        } 
    }
}