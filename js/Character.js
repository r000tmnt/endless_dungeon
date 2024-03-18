import game from './game.js'
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
    constructor(x, y, tileSize, velocity, type, attributes, map, save = null){
        this.x = x;
        this.y = y;
        this.pt = 0;
        this.tileSize = tileSize;
        this.velocity = velocity;
        this.tileMap = map;
        this.#createCharacter(attributes, type, save);
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
            attack: []
        };
        this.ready = false;
        this.frameTimer = 0;
        // this.worker = new Worker('../js/worker/spriteAnimation.js')

        const animation = ['idle', 'top', 'down', 'left', 'right']

        for(let i=0; i < animation.length; i++){
            this.#loadAnimation(animation[i], 2, this.type, attributes.class)

            if(i === (animation.length - 1)){
                console.log(this.animationData)
                this.animation = 'idle'
                this.ready = true
                console.log(this)
            }            
        }
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
            if(!this.isMoving){
                this.isMoving = true
            }
            
            this.#fadeOutTimer(ctx, this.type)
        }else{
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
    
                    // tempContext.globalCompositeOperation = "source-over";
                    ctx.drawImage(tempCanvas, this.x, this.y, this.tileSize, this.tileSize)
    
                    tempCanvas.remove()
                    
                    this.ready = true
                break;
                default:
                    ctx.drawImage(this.animationData[this.animation][this.animationFrame], this.x, this.y, this.tileSize, this.tileSize) 

                    this.ready = true
                break;
            }

            switch(this.animation){
                case 'item':{
                    const frame = ['rgb(144, 255, 144)', 'rgb(144, 255, 144)', 'rgb(144, 238, 144)', 'rgb(144, 238, 144)', 'rgb(144, 238, 144)', 'rgb(144, 255, 144)']

                    const tempCanvas = document.createElement('canvas')
                    const tempContext = tempCanvas.getContext('2d')
                    tempCanvas.width = this.tileSize
                    tempCanvas.height = this.tileSize
                    // draw color
                    tempContext.fillStyle = frame[this.animationFrame]
                    tempContext.fillRect(0, 0, this.tileSize, this.tileSize)
    
                    console.log('current rendering frame :>>>', tempContext.fillStyle)
                    console.log('current rendering frame :>>>', tempContext.fillStyle)
    
                    // set composite mode
                    tempContext.globalCompositeOperation = "destination-in";
    
                    tempContext.drawImage(this.animationData[this.animation][this.animationFrame], 0, 0, this.tileSize, this.tileSize)
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
                }
                break;
                case 'idle':
                    this.#animationTimer(ctx, 50, this.animationData[this.animation][this.animationFrame])
                break;
                case 'top': case 'down': case 'left': case 'right':
                    this.#animationTimer(ctx, 20, this.animationData[this.animation][this.animationFrame])
                break
                // default:{
                // //     // console.log('animation:>>> ', this.animation)
                //     if(this.animation.length){
                //         this.#animationTimer(ctx, 50, this.animationData[this.animation][this.animationFrame])
                //     }
                // }
                // break;
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
        this.animationFrame = 0
        this.frameTimer = 0
    }

    /**
     * Moving the character
     * @param {object} ctx - Canvas context that inculdes various function to control the element
     * @param {object} destination - An object that represent a block which the character is going for
     */
    #move(ctx, destination){
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
            this.#movementInterval(ctx)           
        }else{
            this.#movementInterval(ctx)
        }
        // window.requestAnimationFrame(movementInterval)
    }

    #movementInterval = (ctx) => {
        if(this.y !== this.destination_y){
            this.y = (this.animation === 'top')? this.y - this.velocity : this.y + this.velocity
            // this.#animationTimer(ctx, 20, this.animationData[this.animation][this.animationFrame])
        }else if(this.x !== this.destination_x){
            this.x = (this.animation === 'left')? this.x - this.velocity : this.x + this.velocity
            // this.#animationTimer(ctx, 20, this.animationData[this.animation][this.animationFrame])
        }else{
            // Stop timer
            this.isMoving = false
            if(this.y === this.destination_y && this.x === this.destination_x){
                this.#stopMoving()  
                this.animation = 'idle'
                this.animationFrame = 0
            }  
        }
    }

    #stopMoving(){
        console.log('Stop walking animation')
        // this.walkableSpace.splice(0)
        this.destination = null 
        // Tell the game engine to unfreeze other objects
        game.action.animationInit = false
    }

    async #fadeOutTimer(ctx, type){
        if(this.alpha > 0){
            console.log('blinking')
            ctx.save()
            ctx.globalAlpha = this.alpha
            ctx.drawImage(this.characterImage, this.x, this.y, this.tileSize, this.tileSize)
            ctx.restore()
            this.alpha -= 0.01
        }else{
            console.log('blinking finished')
            this.isMoving = false
            game.removeCharacter(type, this.id)
        }
    }

    /**
     * Create an object for the character
     * @param {object} attributes - character attributes
     * @param {number} type - 2: player, 3: mob 
     * @returns 
     */
    #createCharacter(attributes, type, save){

        switch(type){
            case 2:{
                if(save === null){
                    const job = classes.getOne(attributes.class)
                    this.animation = ''
                    this.id = `${String(Date.now())}P${String(performance.now())}`
                    this.name = attributes.name
                    this.lv = 1
                    this.class = job.name
                    this.class_id = attributes.class
                    this.attributes = {
                        ...job.base_attribute,
                        status: [{ name: 'Focus', turn: 2 }]
                    }     
                    this.prefer_attributes = job.prefer_attributes
                    this.#loadImage(type, job.id)     

                    // If is a player character, set the initial exp and the required points to level up
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
                }else{
                    // Create character from save file
                    this.animation = ''
                    this.id = save.id
                    this.name = save.name
                    this.lv = save.lv
                    this.class = save.class
                    this.class_id = save.class
                    this.attributes = JSON.parse(JSON.stringify(save.attributes))
                    this.prefer_attributes = save.prefer_attributes
                    this.#loadImage(type, save.id)
                    this.exp = save.exp
                    this.pt = save.pt
                    this.requiredExp = save.requiredExp
                    this.bag = JSON.parse(JSON.stringify(save.bag))
                    this.skill = save.skill
                    this.bagLimit = save.bagLimit
                    this.equip = JSON.parse(JSON.stringify(save.equip))
                }
                
                const equipment = this.bag.filter(b => b.type === 3 || b.type === 4)
                // Assign the attributes to the object
                for(let i=0; i < equipment; i++){
                    const itemData = equipment[i].type === 3? weapon.getOne(job.bag[i].id) : armor.getOne(job.bag[i].id)
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
            break    
            case 3:{
                if(save === null){
                    const job = mob.getOne(attributes.class)
                    
                    // Assign the attributes to the object
                    if(job){
                        this.id = `${String(Date.now())}E${String(performance.now())}`
                        this.name = attributes.name
                        this.lv = 1
                        this.class = job.name
                        this.class_id = attributes.class
                        this.attributes = {
                            ...job.base_attribute,
                            status: []
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
                }else{
                    // Create character from save file
                    this.id = save.id
                    this.name = save.name
                    this.lv = save.lv
                    this.class = save.class
                    this.class_id = save.class_id
                    this.attributes = JSON.parse(JSON.stringify(save.attributes))
                    this.prefer_attributes = save.prefer_attributes
                    this.#loadImage(type, save.id)
                    this.givenExp = (job.base_attribute.hp * job.base_attribute.mp) / 2
                    this.drop = JSON.parse(JSON.stringify(save.drop))
                    this.skill = save.skill
                    this.equip = JSON.parse(JSON.stringify(save.equip))
                    this.prefer_skill_type = save.prefer_skill_type
                    this.prefer_action = save.prefer_action
                }
            }
            break
        }

        // Preparing animation frames
        let idle = [], top = [], down = [], left = [], right = []

        this.animationData = { idle, top, down, left, right }
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

    #loadAnimation(animationName, frames, type, className){
        // TODO - Load character animation assets
        for(let i=0; i < frames; i++){
            const newFrame = new Image()
            
            switch(type){
                case 2:
                    newFrame.src = `/assets/images/class/animation/${className}_${animationName}_${i + 1}.png`
                break;
                case 3:
                    newFrame.src = `/assets/images/mob/animation/${className}_${animationName}_${i + 1}.png`
                break;
            }

            this.animationData[animationName][i] = newFrame
        }
    }

    #animationTimer = (ctx, count, frame) => {
        this.frameTimer += 1
        if(this.frameTimer >= count){
            this.frameTimer = 0
            // ctx.save();
            // ctx.clearRect(this.x, this.y, this.tileSize, this.tileSize);
            ctx.drawImage(frame, this.x, this.y, this.tileSize, this.tileSize)     
            // ctx.restore()  
            
            if(this.animationFrame + 1 > (this.animationData[this.animation].length - 1)){
                this.animationFrame = 0
            }else{
                this.animationFrame += 1
            }                             
        }
    }

    setSkills(skill){
        this.skills.push(skill)
    }

    setStatus(status){
        this.status = status
    }

    removeStatus = (status) => {
        const index = this.attributes.status.findIndex(s => s.name === status)

        this.attributes.status.splice(index, 1)
    }
}