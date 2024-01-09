import { animationSignal, removeCharacter } from './game.js'
import classes from './dataBase/class.js'
import mob from './dataBase/mobs.js'
import weapon from './dataBase/item/item_weapon.js'
import armor from './dataBase/item/item_armor.js'
import potion from './dataBase/item/item_potion.js'
import key from './dataBase/item/item_key.js'

export default class Character {
    /**
     * Character object constructor
     * @param {number} x - Character's x axis on the canvas
     * @param {number} y - Character's y axis on the canvas
     * @param {number} tileSize - The size of each tile to draw on the canvas 
     * @param {number} velocity - Character movement speed per pixel
     * @param {number} type - The type of the character 
     * @param {object} attributes - Attributes setting for the character 
     * @param {array} map - A reference of the tile map 
     */
    constructor(x, y, tileSize, velocity, type, attributes, map){
        this.x = x
        this.y = y
        this.pt = 0
        this.tileSize = tileSize
        this.velocity = velocity
        this.tileMap = map
        this.#createCharacter(attributes, type)
        this.characterType = type
        this.characterIsMoving = false
        this.destination = null
        this.walkableSpace = []
        this.wait = false
    }

    /**
     * Draw the character on the canvas
     * @param {function} ctx - canvas.getContext("2d")
     */
    draw(ctx){
        if(!this.characterIsMoving && this.destination){
            this.#move(this.destination)
        }

        // If the character is dead
        if(this?.attributes?.hp <= 0){
            switch(this.characterType){
                case 2:
                    // Leave the body
                    removeCharacter(2)
                break    
                case 3:
                    const fadeOut = [0.7, 1, 0.7, 0.5, 0.3, 0]
                    // Remove body
                    // for(let i=0; i < fadeOut.length; i++){
                    //     ctx.globalAlpha = fadeOut[i];
                    //     ctx.drawImage(this.characterImage, this.x, this.y, this.tileSize, this.tileSize)
                    // }
                    let stepCount = 0

                    const enemyFadeOutTimer = setInterval(() => {
                        if(stepCount !== (fadeOut.length - 1)){
                            ctx.globalAlpha = fadeOut[stepCount];
                            ctx.drawImage(this.characterImage, this.x, this.y, this.tileSize, this.tileSize)
                            stepCount += 1                            
                        }else{
                            clearInterval(enemyFadeOutTimer)
                            // this.characterImage = null
                            ctx.globalAlpha = 1
                            
                            removeCharacter(3)
                        }
                    }, 100)
                break
            }
        }else
        // If the image of the character is loaded
        if(this.characterImage?.src?.length){
            ctx.drawImage(this.characterImage, this.x, this.y, this.tileSize, this.tileSize)
        }
    }

    /**
     * Store an array of walkableSpace
     * @param {array} walkableSpace - A multi dimension array which represent all the blocks the character can reached 
     */
    setWalkableSpace(walkableSpace){
        this.walkableSpace = JSON.parse(JSON.stringify(walkableSpace))
    }

    setCharacterTileSize(tileSize){
        this.tileSize = tileSize
    }

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
    }

    /**
     * Moving the character
     * @param {object} destination - An object that represent a block which the character is going for
     * @param {array} walkableSpace - A multi dimension array which represent all the blocks the character can reached 
     */
    #move(destination){
        console.log('destination :>>>', destination)
        // col ====x, row === y
        const { row, col } = destination

        const currentRow = this.y / this.tileSize
        const currentCol = this.x / this.tileSize

        console.log('Init walking animation')
        this.characterIsMoving = true

        // If the target is at the upper row
        if(row < currentRow){
            const destination_y = row * this.tileSize
            this.#moveUp(destination_y)
        }

        // If the target is at the deeper row
        if(row > currentRow){
            const destination_y = row * this.tileSize
            this.#moveDown(destination_y)
        }

        // If the target is at the left side
        if(col < currentCol){
            const destination_x = col * this.tileSize
            this.#moveLeft(destination_x)            
        }

        // If the target is at the right side
        if(col > currentCol){
            const destination_x = col * this.tileSize
            this.#moveRight(destination_x)  
        }

    }

    #moveUp(destination_y){
        console.log('go up')        
        // Tell the game engine the character is moving
        animationSignal(true)
        let movementInterval = setInterval(() => {
            if(this.y !== destination_y){
                this.y -= this.velocity
            }else{
                // Stop timer
                this.characterIsMoving = false
                clearInterval(movementInterval) 
                if(this.destination !== null){
                    if(this.y === (this.destination.row * this.tileSize)){
                        if(this.x === (this.destination.col * this.tileSize)){
                            this.#stopMoving()                                     
                        }                                     
                    }                    
                } 
            }
        }, 10)
    }

    #moveDown(destination_y){
        console.log('go down to y:>>>', destination_y)
        // Tell the game engine the character is moving
        animationSignal(true)
        let movementInterval = setInterval(() => {
            if(this.y !== destination_y){
                this.y += this.velocity
                console.log('y :>>>', this.y)
            }else{
                // Stop timer
                this.characterIsMoving = false
                clearInterval(movementInterval)  
                if(this.destination !== null){
                    if(this.y === (this.destination.row * this.tileSize)){
                        if(this.x === (this.destination.col * this.tileSize)){
                            this.#stopMoving()                                     
                        }                                      
                    }                    
                }
            }
        }, 10)
    }

    #moveRight(destination_x){
        console.log('go right')
        // Tell the game engine the character is moving
        animationSignal(true)
        let movementInterval = setInterval(() => {
            if(this.x !== destination_x){
                this.x += this.velocity
            }else{
                // Stop timer            
                this.characterIsMoving = false  
                clearInterval(movementInterval)  
                if(this.destination !== null){
                    if(this.x === (this.destination.col * this.tileSize)){
                        if(this.y === (this.destination.row * this.tileSize)){
                            this.#stopMoving()                                     
                        }                                    
                    }                    
                }
            }
        }, 10)
    }

    #moveLeft(destination_x){    
        console.log('go left')        
        // Tell the game engine the character is moving
        animationSignal(true)
        let movementInterval = setInterval(() => {
            if(this.x !== destination_x){
                this.x -= this.velocity
            }else{
                // Stop timer       
                this.characterIsMoving = false 
                clearInterval(movementInterval)
                if(this.destination !== null){
                    if(this.x === (this.destination.col * this.tileSize)){
                        if(this.y === (this.destination.row * this.tileSize)){
                            this.#stopMoving()                                     
                        }                              
                    }                    
                }
            }
        }, 10)
    }

    #stopMoving(){
        console.log('Stop walking animation')
        this.walkableSpace.splice(0)
        this.destination = null 
        // Tell the game engine to unfreeze other objects
        animationSignal(false)
    }

    /**
     * Create an object for the character
     * @param {object} attributes - character attributes
     * @param {number} type - 2: player, 3: mob 
     * @returns 
     */
    #createCharacter(attributes, type){

        switch(type){
            case 2:{
                const job = classes.getOne(attributes.class)
        
                console.log(job)  
                
                // Assign the attributes to the object
                if(job){
                    this.id = Math.floor(Math.random() * 100)
                    this.name = attributes.name
                    this.lv = 1
                    this.class = job.name
                    this.attributes = {
                        ...job.base_attribute,
                        status: 'Healthy'
                    }     
                    this.#loadImage(type, job.id)     

                    // If the character in an a player, set the initial exp and the required points to level up
                    this.exp = 0
                    this.requiredExp = 100
                    this.bag = job.bag
                    this.equip = {
                        head: {},
                        body: {},
                        hand: {},
                        leg: {},
                        foot: {},
                        accessory: {}
                    }

                    // Equip with default setting
                    for(let i=0; i < job.bag.length; i++){
                        if(job.bag[i].type === 3 ||job.bag[i].type === 4){
                            const itemData = job.bag[i].type === 3? weapon.getOne(job.bag[i].id) : armor.getOne(job.bag[i].id)
                            this.equip[itemData.position] = { 
                                id: itemData.id,
                                name: itemData.name
                            }
                        }
                    }
                }
            }
            break    
            case 3:{
                const job = mob.getOne(attributes.class)
        
                console.log(job)  
                
                // Assign the attributes to the object
                if(job){
                    this.id = Math.floor(Math.random() * 100)
                    this.name = attributes.name
                    this.lv = 1
                    this.class = job.name
                    this.attributes = {
                        ...job.base_attribute,
                        status: 'Healthy'
                    }     
                    this.#loadImage(type, job.id)     

                    // If the character in an enemy, set the given exp for player to gain
                    this.givenExp = (job.base_attribute.hp * job.base_attribute.mp) / 2
                    this.drop = job.drop
                }
            }
            break
        }
    }

    /**
     * Load the image of the character
     * @param {number} type - The type of the character 
     * @param {string} id - A string to find the asset
     */
    #loadImage(type, id){
        const classImage = new Image()

        switch(type){
            case 2:
                classImage.src = `/assets/images/class/${id}.png`
            break
            case 3:
                classImage.src = `/assets/images/mob/${id}.png`
            break
        }

        this.characterImage = classImage
    }

    #loadAnimation(job){
        // TODO - Load character animation assets
    }

    setSkills(skill){
        this.skills.push(skill)
    }

    setStatus(status){
        this.status = status
    }
}