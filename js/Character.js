export default class Character {
    // x, y, tile size, velocity, attributes, tile map
    constructor(x, y, tileSize, velocity, attributes, map){
        this.x = x
        this.y = y
        this.tileSize = tileSize
        this.velocity = velocity
        this.tileMap = map
        this.#createCharacter(attributes)
    }

    draw(ctx){
        if(this.destination){
            this.#move(this.destination, this.walkableSpace)
        }

        if(this.characterImage){
            ctx.drawImage(this.characterImage, this.x, this.y, this.tileSize, this.tileSize)
        }
    }

    setWalkableSpace(walkableSpace){
        this.walkableSpace = JSON.parse(JSON.stringify(walkableSpace))
    }

    setDestination(destination){
        this.destination = destination
    }

    // Moving the character
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

    async #createCharacter(attributes){

        // Find player class
        const response = await fetch('../assets/data/class.json')
        let job
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

        if(job){
            this.id = crypto.randomUUID()
            this.name = attributes.name
            this.class = job.name
            this.attributes = {
                ...job.base_attribute,
                stay: false,
                status: 'healthy'
            }
            this.skills = []       
            this.#loadImage(job.id)     
        }

    }

    #loadImage(id){
        const classImage = new Image()
        classImage.src = `../assets/images/class/${id}.png`

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