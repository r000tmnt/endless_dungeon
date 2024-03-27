import game from './game.js'
import mob from './dataBase/mobs.js'
import Audio from './audio.js'
import Character from './Character.js'

export default class Enemy extends Character {
    /**
     * Create an enemy
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
        this.#createEnemy(attributes, save)
        // Sound effects
        this.attackSound = null;
        this.footSteps = [];

        switch(true){
            case attributes.class.includes('zombie'):
                this.attackSound = new Audio(`${__BASE_URL__}assets/audio/monster_bite.mp3`, 'attack')
                this.footSteps.push(new Audio(`${__BASE_URL__}assets/audio/step_dirt_l.mp3`, 'step'))
                this.footSteps.push(new Audio(`${__BASE_URL__}assets/audio/step_dirt_r.mp3`, 'step'))
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

    #createEnemy(attributes, save){
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
                this.#loadImage(job.id)     
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
            this.#loadImage(save.id)
            this.givenExp = (job.base_attribute.hp * job.base_attribute.mp) / 2
            this.drop = JSON.parse(JSON.stringify(save.drop))
            this.skill = save.skill
            this.equip = JSON.parse(JSON.stringify(save.equip))
            this.prefer_skill_type = save.prefer_skill_type
            this.prefer_action = save.prefer_action
        }
    }

    /**
     * Load the image of the character
     * @param {string} id - A string to find the asset
     */
    #loadImage(id){
        const classImage = new Image()
        // this.alpha = 1
        classImage.src = `${__BASE_URL__}assets/images/mob/${id}.png`

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
 
            newFrame.src = `${__BASE_URL__}assets/images/mob/animation/${className}_${animationName}_${i + 1}.png`
    
            this.animationData[animationName][i] = newFrame
        }
    }
}
