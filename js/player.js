import game from './game.js'
import classes from './dataBase/class.js'
import weapon from './dataBase/item/item_weapon.js'
import armor from './dataBase/item/item_armor.js'
import Audio from './audio.js'
import Character from './Character.js'

export default class Player extends Character {
    /**
     * Create a player
     * @param {number} x - Character's x axis on the canvas
     * @param {number} y - Character's y axis on the canvas
     * @param {number} tileSize - The size of each tile to draw on the canvas 
     * @param {number} velocity - Character movement speed per pixel
     * @param {object} attributes - Attributes setting for the character 
     * @param {number} type - The type of the character 
     * @param {array} map - A reference of the tile map 
     * @param {object} save - The character in the save file
     */
    constructor(x, y, tileSize, velocity, attributes, type, map, save = null){
        super(x, y, tileSize, velocity, type, map)   
        this.#createPlayer(attributes, save);
        
        switch(true){
            case attributes.class.includes('fighter'):
                this.footSteps.push(new Audio(`${__BASE_URL__}assets/audio/step_rock_l.mp3`, 'step'))
                this.footSteps.push(new Audio(`${__BASE_URL__}assets/audio/step_rock_r.mp3`, 'step'))
            break;
            // and more...
        }

        const animation = ['idle', 'top', 'down', 'left', 'right', 'attack']

        for(let i=0; i < animation.length; i++){
            this.#loadAnimation(animation[i], 2, attributes.class)

            if(i === (animation.length - 1)){
                console.log(this.animationData)
                this.animation = 'idle'
                this.ready = true
                // console.log(this)
            }            
        }

        this.animationData.cure = [...this.animationData.idle]
        this.animationData.damage = [...this.animationData.idle]
    }

    #createPlayer(attributes, save){
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
            this.#loadImage(job.id)     

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
            this.#loadImage(save.id)
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

    /**
     * Load the image of the character
     * @param {string} id - A string to find the asset
     */
    #loadImage(id){
        const classImage = new Image()
        // this.alpha = 1
        classImage.src = `${__BASE_URL__}assets/images/class/${id}.png`

        this.image = classImage
    }

    /**
     * Dynamically fetch the assets of animation by name and type
     * @param {string} animationName - The name of animation
     * @param {int} frames - The number of frames for the animation
     * @param {int} className - The class of the character
     */
    #loadAnimation(animationName, frames, className){
        for(let i=0; i < frames; i++){
            const newFrame = new Image()
 
            newFrame.src = `${__BASE_URL__}assets/images/class/animation/${className}_${animationName}_${i + 1}.png`

            this.animationData[animationName][i] = newFrame
        }
    }
}
