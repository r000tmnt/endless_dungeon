import Character from "./Character.js";
import { getItemType } from './utils/inventory.js'

// class - 物件創建的模板
export default class TileMap {
    //付值給實體的物件
    constructor(tileSize){
        this.tileSize = tileSize;
        this.wall = this.#image("wall.png")
        this.item = this.#image("item.png")
        // this.enemy = this.#image("zombie.png")
    }

    #image(fileName){
        const img = new Image();
        img.src = `/assets/images/env/${fileName}`;
        return img
    }

    // 地圖樣式的參考列表
    // [{ type: 0; walkable: false }]
    // 0 - ground
    // 1 - wall
    // 2 - player
    // 3 - zombie
    // 4 - item
    map = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 3, 2, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]

    event = [
        // {
        //     position: [], // [y, x],
        //     item: [], // { id: xxxx, type: 0, amount: 1 }
        //     dialogue: [], // String for the scene
        //     trigger: "stepOn" // "stepOn", "beside", "inRange"
        // }
    ]

    enemy = [
        {
            name: 'Zombie',
            job: 'mob_zombie_1'
        }
    ]

    // In what condition does player clear the level
    objective_v = ['Clear all'] // Clear all, pass X turns, Defeat XXX...etc

    // In what condition does player lose the level
    objective_f = ['Defeat all'] // Defeat all, XXX down...etc

    // In what condition does player get bonus
    objective_o = ['Within 6 turns', 'Survive all']

    // Prize for clear the level
    bonus = [
        {
            id: 'currency_1',
            condition: 0,
            amount: 100
        },
        {
            id: 'exp',
            condition: 1,
            based_attribute: 'hp'
        }
    ]

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
                case 1:
                    img = this.wall;
                break;
                case 3:
                    this.map[currentRow][column] = 0
                break;
                case 4:
                    img = this.item;
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
    setEventOnTile = (position, item = [], dialogue = [], trigger = 'stepOn') => {
        this.event.push({position, item, dialogue, trigger})
    }

    // Modify the event on the tile
    modifyEventOnTile = (mode, position, item = [], dialogue = [], trigger = 'stepOn') => {
        const eventIndex = this.event.findIndex(e => e.position.x === position.x && e.position.y === position.y)

        switch(mode){
            case 'replace':
                this.event[eventIndex].item = item
                if(dialogue.length) this.event[eventIndex].dialogue = dialogue
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
                if(dialogue.length) this.event[eventIndex].dialogue = dialogue
                if(trigger.length) this.event[eventIndex].trigger = trigger
            break;
            case 'remove':
                this.event.splice(eventIndex, 1)
                
                // Remove image
                let ctx = document.getElementById('game').getContext("2d");
                ctx.save()
                ctx.globalAlpha = 0
                ctx.drawImage(this.item, position.x, position.y, this.tileSize, this.tileSize)
                ctx.restore()
                this.map[parseInt(position.y / this.tileSize)][parseInt(position.x / this.tileSize)] = 0
            break;
        }
    }

    copyEventToTile(oldPosition, newPosition, item = [], dialogue = []){
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