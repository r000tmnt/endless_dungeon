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
    }

    /**
     * Draw the character on the canvas
     * @param {function} ctx - canvas.getContext("2d")
     */
    draw(ctx){
        if(this.destination){
            this.#move(this.destination, this.walkableSpace)
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
    #move(destination, walkableSpace){
        // col ====x, row === y
        const { row, col } = destination

        const walkable = (row, col) => {
            let walkableIndex = -1

            for(let layer=0; layer < walkableSpace.length; layer++){

                if(walkableIndex >= 0) break

                for(let block=0; block < walkableSpace[layer].length; block++){
                    const block_y = walkableSpace[layer][block][0]
                    const block_x = walkableSpace[layer][block][1]

                    if(block_y === row && block_x === col){
                        walkableIndex = block
                        break
                    }
                }
            }

            return walkableIndex >= 0
        }

        const currentRow = this.y / this.tileSize
        const currentCol = this.x / this.tileSize

        // If the player is at the deeper row
        if(currentRow > row){
            if(walkable((currentRow - 1), currentCol)){
                const destination_y = (currentRow - 1) * this.tileSize

                let movementInterval = setInterval(() => {
                    if(this.y !== destination_y){
                        this.y -= this.velocity
                    }else{
                        clearInterval(movementInterval)
                    }
                }, 50)
            }
        }

        // If the player is at the upper row
        if(currentRow < row){
            if(walkable((currentRow + 1), currentCol)){
                const destination_y = (currentRow + 1) * this.tileSize

                let movementInterval = setInterval(() => {
                    if(this.y !== destination_y){
                        this.y += this.velocity
                        console.log()
                    }else{
                        clearInterval(movementInterval)
                    }
                }, 50)
            }
        }

        // If the player is at right side
        if(currentCol > col){
            if(walkable(currentRow , (currentCol - 1))){
                const destination_x = (currentCol - 1) * this.tileSize

                let movementInterval = setInterval(() => {
                    if(this.x !== destination_x){
                        this.x -= this.velocity
                    }else{
                        clearInterval(movementInterval)
                    }
                }, 50)
            }
        }
        
        // If the player is at the left side
        if(currentCol < col){
            if(walkable(currentRow , (currentCol + 1))){
                const destination_x = (currentCol + 1) * this.tileSize

                let movementInterval = setInterval(() => {
                    if(this.x !== destination_x){
                        this.x += this.velocity
                    }else{
                        clearInterval(movementInterval)
                    }
                }, 50)
            }
        }

        if(this.y === (row * this.tileSize) && this.x === (col * this.tileSize))
        {
            this.walkableSpace.splice(0)
            this.destination = null
        }
        
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
                stay: false,
                status: 'healthy'
            }
            this.skills = []       
            this.#loadImage(type, job.id)     
        }

        // If the character in an enemy, set the given exp for player to gain
        if(type === 3){
            console.log('exp')
            this.givenExp = (job.base_attribute.hp * job.base_attribute.mp) / 2
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