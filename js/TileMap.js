import Character from "./Character.js";
import { getItemType } from './utils/inventory.js'
// import level from "./dataBase/level.js";

// class - 物件創建的模板
export default class TileMa {
    //付值給實體的物件
    constructor(tileSize, levelData){
        this.id = levelData.id;
        this.name = levelData.name;
        this.tileSize = tileSize;
        this.map = levelData.map;
        this.event = levelData.event;
        this.enemy = levelData.enemy;
        this.assets = this.#loadAssetImage(levelData.assets);
        this.objective = levelData.objective;
        this.ready = false;
    }

    #loadAssetImage(assets){
        let tempAssets = []
        assets.forEach(a => {
            const img = new Image();
            if(a.length){
                img.src = `/assets/images/env/${a}`;
                tempAssets.push(img)
            }else{
                tempAssets.push('')
            }
        })
        return tempAssets
    }

    //負責渲染於畫面的函式
    draw(canvas, ctx){
        this.#clearCanvas(canvas, ctx)
        this.#drawMap(ctx, 0);
    }

    #clearCanvas(canvas, ctx){
        ctx.clearRect(0, 0, canvas.width, canvas.height); // x, y, width, height
    }

    #drawMap(ctx, row){
        let currentRow = row

        for(let column = 0; column < this.map[currentRow].length; column++){
            const tile = this.map[currentRow][column];
            let img = null

            switch(tile){
                case 1: case 4:
                    img = this.assets[tile];
                break;
                case 2: case 3:
                    this.map[currentRow][column] = 0
                break;
                default:
                break;
            }


            if(img !== null) ctx.drawImage(img, column * this.tileSize, currentRow * this.tileSize, this.tileSize, this.tileSize)

            this.ready = row === (this.map.length - 1) && column === (this.map[currentRow].length - 1)

            if(column === (this.map[currentRow].length - 1) && currentRow < (this.map.length - 1) ){
                currentRow += 1
                this.#drawMap(ctx, currentRow)
            }
        }
    }

    // Get the player position on the canvas
    getCharacter(velocity, type, name, job){

        for(let row=0; row < this.map.length; row++){
            for(let column = 0; column < this.map[row].length; column++){
                const tile = this.map[row][column];

                if(tile === type){
                    this.map[row][column] = 0

                    const attributes = {
                        name: name, 
                        class: job,
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

    // Set an event on the tile
    setEventOnTile = (position, item = [], scene = [], trigger = 'stepOn') => {
        this.event.push({position, item, scene, trigger})
    }

    // Modify the event on the tile
    modifyEventOnTile = (mode, position, item = [], scene = [], trigger = 'stepOn') => {
        const eventIndex = this.event.findIndex(e => e.position.x === position.x && e.position.y === position.y)

        switch(mode){
            case 'replace':
                this.event[eventIndex].item = item
                if(scene.length) this.event[eventIndex].scene = scene
                if(trigger.length) this.event[eventIndex].trigger = trigger
            break;
            case 'modify':
                // Modify existing event
                item.forEach(i => {
                    const itemExist = this.event[eventIndex].item.findIndex(ei => ei.id === i.id)
                    // If there's the same item on the ground
                    if(itemExist >= 0){
                        const itemData = getItemType(this.event[eventIndex].item)

                        // If the amount of item is less then the limit and will not surpass if stack up
                        if((this.event[eventIndex].item[itemExist].amount + i.amount) < itemData.stackLimit){
                            // Stack the item
                            this.event[eventIndex].item[itemExist].amount += i.amount
                        }else{
                            // Stack up to the limit
                            this.event[eventIndex].item[itemExist].amount = itemData.stackLimit
                            // Append to another space
                            this.event[eventIndex].item.push({ id: i.id, type: i.type, amount: Math.abs(itemData.stackLimit - (this.event[eventIndex].item[itemExist].amount + i.amount))})
                        }
                    }else{
                        this.event[eventIndex].item.push(i)
                    }
                }) 
                if(scene.length) this.event[eventIndex].scene = scene
                if(trigger.length) this.event[eventIndex].trigger = trigger
            break;
            case 'remove':
                this.event.splice(eventIndex, 1)
                
                // Remove image
                // let ctx = document.getElementById('game').getContext("2d");
                const row = parseInt(position.y / this.tileSize)
                const col = parseInt(position.x / this.tileSize)
                // const originalTile = level.getTile(this.id, row, col)
                this.map[row][col] = 0
                // ctx.drawImage(this.assets[4], position.x, position.y, this.tileSize, this.tileSize)
            break;
        }
    }

    copyEventToTile(oldPosition, newPosition, item = [], scene = []){
        // TODO: Alter event position if needed
    }

    getEventOnTile = (position) => {
        return this.event.find(e => e.position.x === position.x && e.position.y === position.y)
    }
    changeTile = (row, col, type) => {
        this.map[row][col] = type
    }

    changeTileSize = (size) => {
        this.tileSize = size
    }

    // Remove a character on the tile map
    removeCharacter(row, col){
        this.map[row][col] = 0
    }
}