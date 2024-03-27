import game from './game.js'
// import potion from './dataBase/item/item_potion.js'
// import key from './dataBase/item/item_key.js'

export default class Character {
    /**
     * Character object constructor
     * @param {number} x - Character's x axis on the canvas
     * @param {number} y - Character's y axis on the canvas
     * @param {number} tileSize - The size of each tile to draw on the canvas 
     * @param {number} velocity - Character movement speed per pixel
     * @param {number} type - The type of the character 
     * @param {array} map - A reference of the tile map 
     */
    constructor(x, y, tileSize, velocity, type, map){
        this.x = x;
        this.y = y;
        this.pt = 0;
        this.tileSize = tileSize;
        this.velocity = velocity;
        this.tileMap = map;
        this.alpha = 1;
        this.type = type;
        this.isMoving = false;
        this.destination = null;
        this.walkableSpace = [];
        this.wait = false;
        this.animation = '';
        this.animationFrame = 0;
        this.animationData = {
            idle: [],
            top: [],
            down: [],
            left: [],
            right: [],
            attack: [],
            cure: [],
            damage: []
        };
        this.ready = false;
        this.frameTimer = 0;
        this.colorFrame = 0;
        this.colors = {
            cure: ['rgb(144, 255, 144)', 'rgb(144, 238, 144)', 'rgb(144, 255, 144)', 'rgb(144, 238, 144)'],
            damage: [ 0, 1, 0, 1 ], // Flickering image in set interval by changing alpha value
            poison: [],
            burn: [],
            debuff: [],
            buff: []
        }

        // Sound effects
        this.attackSound = null;
        this.footSteps = [];
    }

    /**
     * Draw the character on the canvas
     * @param {object} ctx - canvas.getContext("2d")
     * @param {string} filter - The name of filter to apply on the image
     */
    async draw(ctx, filter){
        if(this.destination !== null){
            this.#move(this.destination)
        }

        // If the character is dead
        if(this?.attributes?.hp <= 0){
            if(!this.isMoving){
                this.isMoving = true
            }
            
            this.#fadeOutTimer(ctx, this.type)
        }else{
            switch(this.animation){
                case 'attack':{
                    const frame = this.#setFilter(filter)
                    this.#animationTimer(ctx, 2, frame, false)
                }
                break;
                case 'cure':{
                    const originalFrame = this.animationData[this.animation][this.animationFrame]

                    const tempCanvas = document.createElement('canvas')
                    const tempContext = tempCanvas.getContext('2d')
                    tempCanvas.width = this.tileSize
                    tempCanvas.height = this.tileSize
                    // draw color
                    tempContext.fillStyle = this.colors[this.animation][this.colorFrame]
                    tempContext.fillRect(0, 0, this.tileSize, this.tileSize)
    
                    console.log('current rendering color :>>>', tempContext.fillStyle)
                    console.log('current rendering frame :>>>', originalFrame)
    
                    // set composite mode
                    tempContext.globalCompositeOperation = "destination-in";
    
                    tempContext.drawImage(originalFrame, 0, 0, this.tileSize, this.tileSize)

                    const newFrame = tempCanvas
                    
                    // Change the overlay color every 5 ms
                    if((this.frameTimer % 5) === 0 ){
                        if(this.colorFrame + 1 > (this.colors[this.animation].length - 1)){
                            this.colorFrame = 0
                        }else{
                            this.colorFrame += 1
                        }                        
                    }

                    this.#animationTimer(ctx, 50, newFrame, true)

                    tempCanvas.remove()
                }
                break;
                case 'idle':{
                    const frame = this.#setFilter(filter)
                    this.#animationTimer(ctx, 50, frame, true)
                }
                break;
                case 'top': case 'down': case 'left': case 'right':{
                    const frame = this.#setFilter(filter)
                    // Play the foot steop sound effect
                    // if(this.frameTimer === 20){
                        this.footSteps[this.animationFrame].element.play()
                    // }
                    this.#animationTimer(ctx, 20, frame, true)
                }
                break;
                case 'damage':{
                    this.frameTimer = 0
                    const frame = this.#setFilter(filter)
                    console.log('blinking')
                    ctx.save()
                    ctx.globalAlpha = this.colors[this.animation][this.colorFrame]
                    this.#animationTimer(ctx, 10, frame, true)
                    ctx.restore()
                    
                    if(this.colorFrame === (this.colors[this.animation].length - 1)){
                        this.colorFrame = 0
                    }else{
                        this.colorFrame += 1
                    }   
                }
                break;
            }
        }
    }

    /**
     * Store an array of walkableSpace
     * @param {array} walkableSpace - A multi dimension array which represent all the blocks the character can reached 
     */
    setWalkableSpace(walkableSpace){
        this.walkableSpace = JSON.parse(JSON.stringify(walkableSpace))
    }

    /**
     * Set the tile size of the character sprite
     * @param {int} tileSize - A number represent the size of a tile on the tile map 
     */
    setCharacterTileSize(tileSize){
        this.tileSize = tileSize
    }

    /**
     * Set the position of the character
     * @param {int} x - The number of x axis
     * @param {*} y - The number of y axis
     */
    setCharacterPosition(x, y){
        this.x = x
        this.y = y
    }

    /**
     * Store an object of destination
     * @param {object} destination - An object that represent a block which the character is going for
     */
    setDestination(destination){
        this.destination = destination
        this.animationFrame = 0
        this.frameTimer = 0
    }

    /**
     * Apply filter effect to the image if player wish so.
     * @param {string} filter - The name of filter to apply on the image 
     * @returns - The frame(image) to render on the screen
     */
    #setFilter(filter){
        let newFrame
        switch(filter){
            case 'retro':
                const color = (this.type === 2)? '#33BBFF' : '#FF3333'

                const tempCanvas = document.createElement('canvas')
                const tempContext = tempCanvas.getContext('2d')
                tempCanvas.width = this.tileSize
                tempCanvas.height = this.tileSize

                // set composite mode
                // tempContext.globalCompositeOperation = "multiply";
                tempContext.fillStyle = color
                tempContext.fillRect(0, 0, this.tileSize, this.tileSize)

                // set composite mode
                tempContext.globalCompositeOperation = "destination-in";
                tempContext.drawImage(this.animationData[this.animation][this.animationFrame], 0,0, this.tileSize, this.tileSize)

                newFrame = tempCanvas

                // tempContext.globalCompositeOperation = "source-over";
                // ctx.drawImage(tempCanvas, this.x, this.y, this.tileSize, this.tileSize)

                tempCanvas.remove()
            break;
            default:
                newFrame = this.animationData[this.animation][this.animationFrame]
            break;
        }

        return newFrame
    }

    /**
     * Moving the character
     * @param {object} ctx - Canvas context that inculdes various function to control the element
     * @param {object} destination - An object that represent a block which the character is going for
     */
    #move(destination){
        if(!this.isMoving){
            console.log('destination :>>>', destination)
            // col ====x, row === y
            const { row, col } = destination

            const currentRow = this.y / this.tileSize
            const currentCol = this.x / this.tileSize

            console.log('Init walking animation')
            this.isMoving = true
            this.destination_y = 0
            this.destination_x = 0

            // If the target is at the upper row
            // If the target is at the deeper row
            if(row < currentRow || row > currentRow){
                this.destination_y = row * this.tileSize
                this.destination_x = currentCol * this.tileSize
                this.animation = (row < currentRow)? 'top' : 'down'
            }

            // If the target is at the left side
            // If the target is at the right side
            if(col < currentCol || col > currentCol){
                this.destination_x = col * this.tileSize
                this.destination_y = currentRow * this.tileSize
                this.animation = (col < currentCol)? 'left' : 'right'           
            }

            game.action.animationInit = true
            this.#movementInterval()           
        }else{
            this.#movementInterval()
        }
        // window.requestAnimationFrame(movementInterval)
    }

    /**
     * Moving the image of the character pixel by pixel
     */
    #movementInterval = () => {
        if(this.y !== this.destination_y){
            this.y = (this.animation === 'top')? this.y - this.velocity : this.y + this.velocity
        }else if(this.x !== this.destination_x){
            this.x = (this.animation === 'left')? this.x - this.velocity : this.x + this.velocity
        }else{
            // Stop timer
            this.isMoving = false
            if(this.y === this.destination_y && this.x === this.destination_x){
                this.#stopMoving()
                this.animationFrame = 0
            }  
        }
    }

    /**
     * Reset properties to stop walking animation
     */
    #stopMoving(){
        console.log('Stop walking animation')
        // this.walkableSpace.splice(0)
        this.destination = null 
        // Tell the game engine to unfreeze other objects
        game.action.animationInit = false
    }

    /**
     * Fade out the character image upon defeated
     * @param {obj} ctx - The context of the canvas  
     * @param {int} type - The type of the character, player or enemy...etc 
     */
    async #fadeOutTimer(ctx, type){
        if(this.alpha > 0){
            console.log('fading')
            ctx.save()
            ctx.globalAlpha = this.alpha
            ctx.drawImage(this.image, this.x, this.y, this.tileSize, this.tileSize)
            ctx.restore()
            this.alpha -= 0.01
        }else{
            console.log('blinking finished')
            this.isMoving = false
            game.removeCharacter(type, this.id)
        }
    }

    /**
     * Count animation frame
     * @param {object} ctx - The context of the canvas 
     * @param {int} count - A number as the interval to count before changing image 
     * @param {HTMLImageElement} frame - The image to render
     * @param {bool} loop - A value to decide to animation will loop or not 
     */
    #animationTimer = (ctx, count, frame, loop) => {
        this.frameTimer += 1
        if(this.frameTimer >= count){
            this.frameTimer = 0
            // ctx.save();
            // ctx.clearRect(this.x, this.y, this.tileSize, this.tileSize);
            ctx.drawImage(frame, this.x, this.y, this.tileSize, this.tileSize)     
            // ctx.restore()  
            
            if(this.animationFrame + 1 > (this.animationData[this.animation].length - 1)){
                this.animationFrame = (loop)? 0 : this.animationFrame
                console.log('set animation frame :>>>', this.animation)
            }else{
                this.animationFrame += 1
                console.log('increse animation frame count :>>>', this.animationFrame)
            }                             
        }else{
            // Draw the same picture
            ctx.drawImage(frame, this.x, this.y, this.tileSize, this.tileSize)
        }
    }

    /**
     * Character learn skill
     * @param {string} skill - The string to identify which skill the character to learn 
     */
    setSkills(skill){
        this.skill.push(skill)
    }

    /**
     * Remove the status from the character
     * @param {string} status - The name of the status 
     */
    removeStatus = (status) => {
        const index = this.attributes.status.findIndex(s => s.name === status)

        this.attributes.status.splice(index, 1)
    }
}