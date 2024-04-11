import game from './game.js'
import classes from './dataBase/class.js'
import mob from './dataBase/mobs.js'
import weapon from './dataBase/item/item_weapon.js'
import armor from './dataBase/item/item_armor.js'
import potion from './dataBase/item/item_potion.js'
import key from './dataBase/item/item_key.js'
import Audio from './audio.js'

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
            attack: [],
            cure: [],
            damage: []
        };
        // Combine the two for display
        this.base_attribute = {}
        this.change_attribute = {
            hp: 0, 
            mp: 0, 
            maxHp: 0, 
            maxMp: 0, 
            str: 0, 
            def: 0, 
            int: 0,
            spd: 0, 
            spi: 0,
            ap: 0,
            lck: 0,
            maxAp: 0,
            moveSpeed: 0,
            sight: 0
        },
        this.totalAttribute = {}
        this.status = []
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

        switch(true){
            case attributes.class.includes('fighter'):
                this.footSteps.push(new Audio(`${__BASE_URL__}assets/audio/step_rock_l.mp3`, 'step'))
                this.footSteps.push(new Audio(`${__BASE_URL__}assets/audio/step_rock_r.mp3`, 'step'))
            break;
            case attributes.class.includes('zombie'):
                this.attackSound = new Audio(`${__BASE_URL__}assets/audio/monster_bite.mp3`, 'attack')
                this.footSteps.push(new Audio(`${__BASE_URL__}assets/audio/step_dirt_l.mp3`, 'step'))
                this.footSteps.push(new Audio(`${__BASE_URL__}assets/audio/step_dirt_r.mp3`, 'step'))
            break;
        }

        const animation = ['idle', 'top', 'down', 'left', 'right', 'attack']

        for(let i=0; i < animation.length; i++){
            this.#loadAnimation(animation[i], 2, this.type, attributes.class)

            if(i === (animation.length - 1)){
                console.log(this.animationData)
                this.animation = 'idle'
                this.ready = true
                console.log(this)
            }            
        }

        this.animationData.cure = [...this.animationData.idle]
        this.animationData.damage = [...this.animationData.idle]
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
        if(this.totalAttribute.hp <= 0){
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
                    this.base_attribute = {
                        ...job.base_attribute
                    },
                    this.status = [{ name: 'Focus', turn: 2 }]
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
                    this.base_attribute = JSON.parse(JSON.stringify(save.base_attribute))
                    this.change_attribute = JSON.parse(JSON.stringify(save.change_attribute))
                    this.prefer_attributes = save.prefer_attributes
                    this.status = JSON.parse(JSON.stringify(save.status))
                    this.#loadImage(type, save.id)
                    this.exp = save.exp
                    this.pt = save.pt
                    this.requiredExp = save.requiredExp
                    this.bag = JSON.parse(JSON.stringify(save.bag))
                    this.skill = save.skill
                    this.bagLimit = save.bagLimit
                    this.equip = JSON.parse(JSON.stringify(save.equip))
                }

                for(let [key, value] in Object.entries(this.base_attribute)){
                    this.totalAttribute[key] = this.change_attribute[key] + value
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
                        const newVal = itemData.effect.base_attribute[key] + val
                        this.totalAttribute[key] = newVal
                        this.change_attribute[key] = newVal
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
                            ...job.base_attribute
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
                    this.base_attribute = JSON.parse(JSON.stringify(save.base_attribute))
                    this.change_attribute = JSON.parse(JSON.stringify(save.change_attribute))
                    this.status = JSON.parse(JSON.stringify(save.status))
                    this.prefer_attributes = save.prefer_attributes
                    this.#loadImage(type, save.id)
                    this.givenExp = (job.base_attribute.hp * job.base_attribute.mp) / 2
                    this.drop = JSON.parse(JSON.stringify(save.drop))
                    this.skill = save.skill
                    this.equip = JSON.parse(JSON.stringify(save.equip))
                    this.prefer_skill_type = save.prefer_skill_type
                    this.prefer_action = save.prefer_action
                }

                for(let [key, value] in Object.entries(this.base_attribute)){
                    this.totalAttribute[key] = this.change_attribute[key] + value
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
                classImage.src = `${__BASE_URL__}assets/images/class/${id}.png`
            break
            case 3:
                classImage.src = `${__BASE_URL__}assets/images/mob/${id}.png`
            break
        }

        this.characterImage = classImage
    }

    /**
     * Dynamically fetch the assets of animation by name and type
     * @param {string} animationName - The name of animation
     * @param {int} frames - The number of frames for the animation
     * @param {int} type - The type of the character this animation belongs to
     * @param {int} className - The class of the character
     */
    #loadAnimation(animationName, frames, type, className){
        // TODO - Load character animation assets
        for(let i=0; i < frames; i++){
            const newFrame = new Image()
            
            switch(type){
                case 2:
                    newFrame.src = `${__BASE_URL__}assets/images/class/animation/${className}_${animationName}_${i + 1}.png`
                break;
                case 3:
                    newFrame.src = `${__BASE_URL__}assets/images/mob/animation/${className}_${animationName}_${i + 1}.png`
                break;
            }

            this.animationData[animationName][i] = newFrame
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
        const index = this.status.findIndex(s => s.name === status)

        this.status.splice(index, 1)
    }
}