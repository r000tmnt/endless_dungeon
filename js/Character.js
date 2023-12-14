import { animationSignal } from './game.js'

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
        this.tileSize = tileSize
        this.velocity = velocity
        this.tileMap = map
        this.#createCharacter(attributes, type)
        this.characterIsMoving = false
        this.destination = null
    }

    /**
     * Draw the character on the canvas
     * @param {function} ctx - canvas.getContext("2d")
     */
    draw(ctx){
        if(!this.characterIsMoving && this.destination){
            this.#move(this.destination)
        }

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
                if(this.y === (this.destination.row * this.tileSize)){
                    if(this.x === (this.destination.col * this.tileSize)){
                        this.#stopMoving()                                     
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
                if(this.y === (this.destination.row * this.tileSize)){
                    if(this.x === (this.destination.col * this.tileSize)){
                        this.#stopMoving()                                     
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
                if(this.x === (this.destination.col * this.tileSize)){
                    if(this.y === (this.destination.row * this.tileSize)){
                        this.#stopMoving()                                     
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
                if(this.x === (this.destination.col * this.tileSize)){
                    if(this.y === (this.destination.row * this.tileSize)){
                        this.#stopMoving()                                     
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
    async #createCharacter(attributes, type){

        let requestUrl = ""
        let job

        switch(type){
            case 2:
                requestUrl = '../assets/data/class.json'
            break    
            case 3:
                requestUrl = '../assets/data/mobs.json'
            break
        }

        // Find character class
        const response = await fetch(requestUrl)

        try {
            const result = await response.json()
            console.log(result)
            console.log(typeof result)
    
            const classes = Object.values(result)
    
            console.log(classes)
    
            for(let i=0; i < classes.length; i++){
                if(classes[i].id === attributes.class){
                    job = classes[i]
                    break
                }
            }
    
            console.log(job)                        
        } catch (error) {
            console.log(error)
            return error
        }

        // Assign the attributes to the object
        if(job){
            this.id = crypto.randomUUID()
            this.name = attributes.name
            this.lv = 1
            this.class = job.name
            this.attributes = {
                ...job.base_attribute,
                status: 'healthy'
            }
            this.wait = false,
            this.skills = []       
            this.#loadImage(type, job.id)     
        }

        switch(type){
            case 2:
                // If the character in an a player, set the initial exp and the required points to level up
                this.exp = 0
                this.requiredExp = 100
            break    
            case 3:
                // If the character in an enemy, set the given exp for player to gain
                this.givenExp = (job.base_attribute.hp * job.base_attribute.mp) / 2
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
                classImage.src = `../assets/images/class/${id}.png`
            break
            case 3:
                classImage.src = `../assets/images/mob/${id}.png`
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