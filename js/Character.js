import { animationSignal, removeCharacter, setTile, setEvent } from './game.js'
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
        this.animation = ''
        this.animationFrame = 0
        // this.worker = new Worker('../js/worker/spriteAnimation.js')
    }

    /**
     * Draw the character on the canvas
     * @param {function} ctx - canvas.getContext("2d")
     */
    async draw(ctx, filter){
        if(this.destination !== null){
            this.#move(ctx, this.destination)
        }

        // If the character is dead
        if(this?.attributes?.hp <= 0){
            if(!this.characterIsMoving){
                this.characterIsMoving = true
                switch(this.characterType){
                    case 2:
                        // Leave the body
                        // removeCharacter(2)
                    break    
                    case 3:
                        this.#fadeOutTimer(ctx, this.characterType)
                    break
                } 
            }else{
                this.#fadeOutTimer(ctx, this.characterType)
            }
        }else
        // If the image of the character is loaded
        if(!this.characterIsMoving && this.characterImage?.src?.length){
            
            if(filter === 'retro'){
                const color = (this.characterType === 2)? '#33BBFF' : '#FF3333'

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
                tempContext.drawImage(this.characterImage, 0, 0, this.tileSize, this.tileSize)

                // tempContext.globalCompositeOperation = "source-over";
                ctx.drawImage(tempCanvas, this.x, this.y, this.tileSize, this.tileSize)

                tempCanvas.remove()
            }else

            //TODO: Need to know if the item is used on the character somehow...
            if(this.animation === 'item'){
                const frame = ['rgb(144, 255, 144)', 'rgb(144, 255, 144)', 'rgb(144, 238, 144)', 'rgb(144, 238, 144)', 'rgb(144, 238, 144)', 'rgb(144, 255, 144)']

                const tempCanvas = document.createElement('canvas')
                const tempContext = tempCanvas.getContext('2d')
                tempCanvas.width = this.tileSize
                tempCanvas.height = this.tileSize
                // draw color
                tempContext.fillStyle = frame[this.animationFrame]
                tempContext.fillRect(0, 0, this.tileSize, this.tileSize)

                console.log('current rendering frame :>>>', tempContext.fillStyle)

                // set composite mode
                tempContext.globalCompositeOperation = "destination-in";

                tempContext.drawImage(this.characterImage, 0, 0, this.tileSize, this.tileSize)
                // const imgBitMap = await createImageBitmap(this.characterImage)
                // this.worker.postMessage({mode: this.animation, image: imgBitMap, tileSize: this.tileSize})

                // this.worker.onmessage = (msg) => {
                //     console.log('sprite altered :>>>', msg)
                //     if(msg.data.buffer){
                //         ctx.clearRect(this.x, this.y, this.tileSize, this.tileSize)
                //         ctx.save()
                        ctx.drawImage(tempCanvas, this.x, this.y, this.tileSize, this.tileSize)
                //         ctx.restore()
                //     }
                // }
                tempCanvas.remove()
                if(this.animationFrame + 1 > (frame.length - 1)){
                    this.animationFrame = 0
                }else{
                    this.animationFrame += 1
                }
            }else{
                ctx.drawImage(this.characterImage, this.x, this.y, this.tileSize, this.tileSize)                
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
     * @param {object} ctx - Canvas context that inculdes various function to control the element
     * @param {object} destination - An object that represent a block which the character is going for
     */
    #move(ctx, destination){
        if(!this.characterIsMoving){
            console.log('destination :>>>', destination)
            // col ====x, row === y
            const { row, col } = destination

            const currentRow = this.y / this.tileSize
            const currentCol = this.x / this.tileSize

            console.log('Init walking animation')
            this.characterIsMoving = true
            this.movingDirection = ''
            this.destination_y = 0
            this.destination_x = 0

            // If the target is at the upper row
            // If the target is at the deeper row
            if(row < currentRow || row > currentRow){
                this.destination_y = row * this.tileSize
                this.destination_x = currentCol * this.tileSize
                this.movingDirection = (row < currentRow)? 'top' : 'down'
            }

            // If the target is at the left side
            // If the target is at the right side
            if(col < currentCol || col > currentCol){
                this.destination_x = col * this.tileSize
                this.destination_y = currentRow * this.tileSize
                this.movingDirection = (col < currentCol)? 'left' : 'right'           
            }

            animationSignal(true) 
            this.#movementInterval(ctx)           
        }else{
            this.#movementInterval(ctx)
        }
        // window.requestAnimationFrame(movementInterval)
    }

    #movementInterval = (ctx) => {
        if(this.y !== this.destination_y){
            this.y = (this.movingDirection === 'top')? this.y - this.velocity : this.y + this.velocity
            ctx.drawImage(this.characterImage, this.x, this.y, this.tileSize, this.tileSize)
        }else if(this.x !== this.destination_x){
            this.x = (this.movingDirection === 'left')? this.x - this.velocity : this.x + this.velocity
            ctx.drawImage(this.characterImage, this.x, this.y, this.tileSize, this.tileSize)
        }else{
            // Stop timer
            this.characterIsMoving = false
            if(this.y === this.destination_y && this.x === this.destination_x){
                this.#stopMoving()                                     
            }  
        }
    }

    #stopMoving(){
        console.log('Stop walking animation')
        // this.walkableSpace.splice(0)
        this.destination = null 
        // Tell the game engine to unfreeze other objects
        animationSignal(false)
    }

    async #fadeOutTimer(ctx, characterType){
        if(this.alpha > 0){
            console.log('blinking')
            ctx.save()
            ctx.globalAlpha = this.alpha
            ctx.drawImage(this.characterImage, this.x, this.y, this.tileSize, this.tileSize)
            ctx.restore()
            this.alpha -= 0.01
        }else{
            console.log('blinking finished')
            this.characterIsMoving = false
            removeCharacter(characterType)

            // If player lose, drop all items
            if(this?.bag?.length){
                setEvent({x: enemy.x, y: enemy.y}, this.bag)
                setTile(parseInt(this.y / this.tileSize), parseInt(this.x / this.tileSize), 4)
            }
        }
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
                    this.id = `${String(Date.now())}P${String(performance.now())}`
                    this.name = attributes.name
                    this.lv = 1
                    this.class = job.name
                    this.attributes = {
                        ...job.base_attribute,
                        status: 'Healthy'
                    }     
                    this.prefer_attributes = job.prefer_attributes
                    this.#loadImage(type, job.id)     

                    // If the character in an a player, set the initial exp and the required points to level up
                    this.exp = 95
                    this.pt = 0
                    this.requiredExp = 100
                    this.bag = job.bag
                    this.skill = job.skill
                    this.bagLimit = 100
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
                            // Change attribute value
                            for(let [key, val] of Object.entries(itemData.effect.base_attribute)){
                                this.attributes[key] += itemData.effect.base_attribute[key]
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
                    this.id = `${String(Date.now())}E${String(performance.now())}`
                    this.name = attributes.name
                    this.lv = 1
                    this.class = job.name
                    this.attributes = {
                        ...job.base_attribute,
                        status: 'Healthy'
                    }     
                    this.prefer_attributes = job.prefer_attributes
                    this.#loadImage(type, job.id)     
                    this.pt = 0
                    this.equip = {
                        head: {},
                        body: {},
                        hand: {},
                        leg: {},
                        foot: {},
                        accessory: {}
                    }
                    // If the character is an enemy, set the given exp for player to gain
                    this.givenExp = (job.base_attribute.hp * job.base_attribute.mp) / 2
                    this.drop = job.drop
                    this.skill = job.skill
                    this.prefer_skill_type = job.prefer_skill_type
                    this.prefer_action = job.prefer_action
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
        this.alpha = 1
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