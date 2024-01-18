import { prepareDirections, getDistance, getAvailableSpace } from './utils/pathFinding.js';
import { skillAttack, weaponAttack } from './utils/battle.js';
import skills from './dataBase/skills.js';
import setting from './utils/setting.js';

export default class Action{
    constructor(mode, selectableSpace, reachableDirections, steps, animationInit){
        this.mode = mode
        this.selectableSpace = selectableSpace
        this.reachableDirections = reachableDirections
        this.steps = steps
        this.animationInit = animationInit.Action
        this.messageConfig = {
            message: '',
            style: 'yellow',
            size: 0,
        },
        this.selectedSkill = {}
    }

    /**
     * Prepare walkable space
     * @param {object} tileMap - An object represent the tile map
     * @param {object} playerPosition - An object represent player's position
     * @param {number} moveSpeed - A number indicated the amount of blocks for each direction in straight line  
     * @param {object} enemyPosition - An object represent enemy's position
     */
    async setMove(tileMap, playerPosition, moveSpeed, enemyPosition){
        this.mode = 'move'
        this.selectableSpace = await getAvailableSpace(tileMap, playerPosition, moveSpeed, enemyPosition)
        console.log("playerWalkableSpace : >>>", this.selectableSpace)  
    }

    /**
     * Prepare a range of blocks for attack
     * @param {object} tileMap - An object represent the tile map
     * @param {object} playerPosition - An object represent player's position
     * @param {number} attackRange - A number indicated the amount of blocks for each direction in straight line  
     */
    async setAttack(tileMap, playerPosition, attackRange){
        this.mode = 'attack'
        this.selectableSpace = await getAvailableSpace(tileMap, playerPosition, attackRange)
    }

    clearSkillWindow(){
        const skillList = document.querySelector('.learned-skills')
        while(skillList.firstChild){
            skillList.removeChild(skillList.firstChild)
        }
    }

    resizeSkillWindow(fontSize, fontSize_sm){
        const skillList = document.querySelectorAll('.skill')
        const title = document.getElementById('skill').children[0]

        title.style.fontSize = fontSize + 'px'

        skillList.forEach(skill => {
            skill.style.fontSize = fontSize_sm + 'px'
        })
    }

    // TODO: Skill menu
    setSKillWindow(currentActingPlayer, tileMap, playerPosition){
        this.mode = 'skill'
        
        const skillWindow = document.getElementById('skill')
        const title = skillWindow.children[0]
        const skillList = document.querySelector('.learned-skills')
        const { fontSize, fontSize_sm } = setting.general
        const { width } = setting.general.camera
        const skillItemHeight = Math.floor(width * (30/100))

        title.style.fontSize = fontSize + 'px'

        for(let i=0; i < currentActingPlayer.skill.length; i++){
            const skillData = skills.getOne(currentActingPlayer.skill[i])
            const skill = document.createElement('li')
            const skillIcon = document.createElement('img')
            const skillInfo = document.createElement('div')
            const skillLabel = document.createElement('div')
            const skillName = document.createElement('span')
            const skillCost = document.createElement('span')
            const skillDesc = document.createElement('span')
            skill.classList.add('flex')
            skill.classList.add('skill')
            skill.style.fontSize = fontSize + 'px'
            skill.style.height = skillItemHeight + 'px'
            skill.style.boxSizing = 'border-box'
            skill.style.padding = `${fontSize_sm}px`  

            skillIcon.style.width = tileMap.tileSize + 'px'
            skillIcon.style.height = tileMap.tileSize + 'px'
            skillIcon.style.margin = `0 ${fontSize_sm}px`

            skillName.innerText = skillData.name
            skillCost.innerText = `${skillData.cost.attribute}: ${skillData.cost.value}`
            skillDesc.innerText = skillData.effect.desc

            skillLabel.classList.add('flex')
            skillLabel.style.justifyContent = 'space-between'
            skillLabel.append(skillName)
            skillLabel.append(skillCost)

            skillInfo.append(skillLabel)
            skillInfo.append(skillDesc)

            if(currentActingPlayer.attributes[skillData.cost.attribute] > skillData.cost.value ){
                skill.addEventListener('click', async() => {
                    // Keep the skill
                    this.selectedSkill = skillData
                    // Get skill effect range
                    this.selectableSpace = await getAvailableSpace(tileMap, playerPosition, skillData.effect.range)
                    // Close skill window
                    skillWindow.classList.add('invisible')
                })                
            }else{
                // No click event if not usable
                skill.style.color = 'grey'
            }

            skill.append(skillIcon)
            skill.append(skillInfo)
            skillList.append(skill)
        }
        skillList.style.maxHeight = (skillItemHeight * 3) + 'px'
        skillWindow.classList.remove('invisible')
        skillWindow.classList.add('open_window')
    }

    resizeStatusWindow(){
        const statusWindow = document.getElementById('status')
        const statusInfo = document.getElementById('info')
        const statusLv = statusWindow.children[2]
        const statusTable = statusWindow.children[3]
        const { fontSize_sm } = setting.general

        statusInfo.style.fontSize = fontSize_sm + 'px' 
        statusLv.style.fontSize = fontSize_sm + 'px' 
        const tableNode = statusTable.querySelectorAll('td')

        for(let i=0; i < tableNode.length; i++){
            tableNode[i].style.fontSize = fontSize_sm + 'px'
        }
    }

    /**
     * Set text information for status dialog
     * @param {object} inspectingCharacter - A set of data about the inspecting character 
     */
    setStatusWindow(inspectingCharacter){
        const statusWindow = document.getElementById('status')
        const avatar = document.getElementById('avatar')
        const statusInfo = document.getElementById('info')
        const statusLv = statusWindow.children[2]
        const statusTable = statusWindow.children[3]
        const { fontSize_sm } = setting.general

        this.mode = 'status'

        const tableNode = statusTable.querySelectorAll('td')

        // Insert status information
        statusInfo.children[0].innerText = inspectingCharacter.name
        statusInfo.children[1].innerText = inspectingCharacter.class
        statusInfo.style.fontSize = fontSize_sm + 'px' 
        statusLv.innerText = `LV ${inspectingCharacter.lv}`
        statusLv.style.fontSize = fontSize_sm + 'px' 

        for(let i=0; i < tableNode.length; i++){
            tableNode[i].style.fontSize = fontSize_sm + 'px'
            if(tableNode[i].dataset.attribute !== undefined){
                switch(tableNode[i].dataset.attribute){
                    case 'hp':
                        tableNode[i].innerText = `${inspectingCharacter.attributes.hp} / ${inspectingCharacter.attributes.maxHp}`
                    break;
                    case 'mp':
                        tableNode[i].innerText = `${inspectingCharacter.attributes.mp} / ${inspectingCharacter.attributes.maxMp}`
                    break;
                    case 'ap':
                        tableNode[i].innerText = `${inspectingCharacter.attributes.ap} / ${inspectingCharacter.attributes.maxAp}`
                    break;
                    case 'exp':
                        tableNode[i].innerText = `${inspectingCharacter.exp? inspectingCharacter.exp : 0 } / ${inspectingCharacter.requiredExp? inspectingCharacter.requiredExp : 0}`
                    break;
                    default:
                        tableNode[i].innerText = `${inspectingCharacter.attributes[`${tableNode[i].dataset.attribute}`]}`
                    break;
                }
            }
        }

        statusWindow.classList.remove('invisible')
        statusWindow.classList.add('open_window')
    }

    setFontSize = (size) => {
        this.messageConfig.size = size
    }

    /**
     * Get walkable directions and start moving
     * @param {object} tileMap - An object represent the tile map
     * @param {number} row - A number indicates which row ( y axis ) is user pointed
     * @param {number} col - A number indicates which col ( x axis ) is user pointed
     * @param {object} playerPosition - An object contains the row and col position of the current acting player 
     * @param {object} currentActingPlayer - An onbject contains the information about the current acting character 
     * @param {function} characterAnimationPhaseEnded - A callBack function to init after animation finished 
     * @returns {boolean} A value represend the state of pointed block is ib the range or not
     */
    async move(tileMap, row, col, playerPosition, currentActingPlayer, characterAnimationPhaseEnded){
        const inRange = await this.#checkIfInRange(row, col)

        if(inRange){
            this.reachableDirections = await prepareDirections(tileMap, playerPosition, { row, col }, this.reachableDirections)
            // characterCaption.classList.remove('visible')

            currentActingPlayer.setWalkableSpace(this.selectableSpace)  

            // Start moving
            // Maybe I need a global variable to track the steps...
            this.#beginAnimationPhase(currentActingPlayer, characterAnimationPhaseEnded)
        }else{
            this.selectableSpace.splice(0)
        }

        return inRange
    }
    
    async command(canvas, row, col, player, enemy, enemyPosition, tileSize, tileMap, characterAnimationPhaseEnded){
        const inRange = await this.#checkIfInRange(row, col)

        if(inRange){
            if(enemyPosition.row === row && enemyPosition.col === col)
                this.animationInit = true

                const horizontalLine = Math.floor(9 / 2)
                const verticalLine = 16 / 2

                const offsetX = (horizontalLine - col) * tileSize
                const offsetY = (verticalLine - row) * tileSize  

                canvas.style.transform = `scale(1.5) translate(${offsetX}px, ${offsetY}px)`

                this.selectableSpace.splice(0)
                console.log('clear selectable :>>>', this.selectableSpace)

                setTimeout(async() => {
                    switch(this.mode){
                        case 'attack':
                            this.messageConfig.message = await weaponAttack(player, enemy, tileMap, row, col)
                        break;
                        case 'skill':
                            const { attribute, value } = this.selectedSkill
                            player.attributes[attribute] -= value

                            this.messageConfig.message = await skillAttack(this.selectedSkill, player, enemy, tileMap, row, col)
                        break;
                        case 'item':
                        break;
                    }

                    const { message, style, size} = this.messageConfig
                    
                    this.#displayMessage(canvas, message, Math.floor(size * 1.5), style, Math.floor((tileSize * 9) / 2) - tileSize, Math.floor((tileSize * 16) / 2) - tileSize, characterAnimationPhaseEnded)    
                }, 300)
        }else{
            this.selectableSpace.splice(0)
        }

        return inRange
    }

    stay(currentActingPlayer, characterAnimationPhaseEnded){
        this.mode = 'stay'
        this.#beginAnimationPhase(currentActingPlayer, characterAnimationPhaseEnded)
    }

    async #checkIfInRange(row, col) {
        let inRange = false
        // Loop through the array and find if the position matches
        for(let i=0; i < this.selectableSpace.length; i++){
            if(inRange){
                break // Escape outer loop if true
            }else{
                for(let j=0; j < this.selectableSpace[i].length; j++){
                    if(this.selectableSpace[i][j][0] === row && this.selectableSpace[i][j][1] === col){
                        inRange = true  
                        break // Escape inner loop if ture
                    }
                }
            }
        }

        return inRange
    }

    /**
     * Start moving
     * @param {object} currentActingPlayer - An object represent current acting player 
     * @param {function} characterAnimationPhaseEnded - A callBack function to init after animation finished 
     */
    #beginAnimationPhase(currentActingPlayer, characterAnimationPhaseEnded) {
        console.log('step :>>>', this.steps)

        if(this.mode !== 'stay'){
            // First step
            currentActingPlayer.setDestination({row: this.reachableDirections[this.steps][0], col: this.reachableDirections[this.steps][1]})            
        }


        // Waiting for the animation to end 
        let animationWatcher = setInterval(async() => {
            // If animation ended
            if(!this.animationInit) {
                // If steps is not the same as the length of the array
                if(this.steps < (this.reachableDirections.length - 1)){
                    console.log('step :>>>', this.steps)
                    // Begin next step
                    this.steps += 1
                    currentActingPlayer.setDestination({row: this.reachableDirections[this.steps][0], col: this.reachableDirections[this.steps][1]})
                }else{
                    // Finish the phase
                    // Reset steps
                    this.steps = 0

                    // Clear the array
                    this.selectableSpace.splice(0)

                    this.reachableDirections.splice(0)

                    // Spend an action point
                    // currentActingPlayer.attributes.ap -= 1

                    clearInterval(animationWatcher)

                    characterAnimationPhaseEnded()
                }  
            }else{
                console.log('watching animation')
            }
        }, 100) 
    }

    // Text information about damage, heal, poisoned... etc
    #displayMessage(canvas, message, size, style, x, y, characterAnimationPhaseEnded) {
        const appWrapper = document.getElementById('wrapper')
        const messageHolder = document.createElement('span')
        messageHolder.innerText = message
        messageHolder.style.fontSize = (size / 2) + 'px'
        messageHolder.style.fontWeight = 'bold'
        messageHolder.style.color = style
        messageHolder.style.textAlign = 'center'
        messageHolder.style.position = 'absolute',
        messageHolder.style.top = y + 'px'
        messageHolder.style.left = x + 'px'
        appWrapper.append(messageHolder)
    
        // Clear message
        setTimeout(() => {
            messageHolder.remove()
            canvas.style.transform = `unset`
        }, 1000)
    
        // Spend an action point
        setTimeout(() => {
            this.animationInit = false
            characterAnimationPhaseEnded()
        }, 1500)
    }

    async enemyMove(tileMap, enemyPosition, moveSpeed, sight, playerPosition,currentActingPlayer, characterAnimationPhaseEnded) {
        // get walkable space
        await this.setMove(tileMap, enemyPosition, moveSpeed, playerPosition)

        // if(this.selectableSpace.length) this.mode = 'search'

        const enemySight = await getAvailableSpace(tileMap, enemyPosition, sight)

        // find where to go
        const findXandY = async() => {
            let playerDetect = false
            console.log('enemyAI finding player')
            // Check if the player is in the visible range
            for(let i = 0; i < enemySight.length; i++){

                // if player is in the range, break the loop
                if(playerDetect){
                    break
                }else{
                    for(let block = 0; block < enemySight[i].length; block++){
                        if(enemySight[i][block][0] === playerPosition.row && enemySight[i][block][1] === playerPosition.col){
                            playerDetect = true
                        }  
                    }                
                }

            }
            
            if(playerDetect){
                console.log('enemyAI found player')            

                // Decide which block to take as destination
                const allDistance = []

                this.selectableSpace.forEach(layer => {
                    layer.forEach(block => {
                        allDistance.push({ cost: getDistance(block[1], block[0], playerPosition), x: block[1], y: block[0] }) 
                    })
                }) 

                console.log('all distance :>>>', allDistance)

                const shortest = allDistance.findIndex(d => d.cost === Math.min(...allDistance.map(r => r.cost)))


                if(shortest >= 0){
                    this.reachableDirections = await prepareDirections(tileMap, enemyPosition, { row: allDistance[shortest].y, col: allDistance[shortest].x }, this.reachableDirections)

                    console.log("reachableDirections :>>>", this.reachableDirections)

                    if(this.reachableDirections.length){
                        // Start moving
                        currentActingPlayer.setWalkableSpace(this.selectableSpace)
                        this.#beginAnimationPhase(currentActingPlayer, characterAnimationPhaseEnded)  
                    }else{
                        // Spend an action point
                        characterAnimationPhaseEnded()  
                    }                   
                }else{
                    console.log('Player out of reach')

                    await this.#randomSteps(tileMap, currentActingPlayer, enemyPosition, characterAnimationPhaseEnded)
                }
            }else{
                console.log('enemyAI can not find the player')

                await this.#randomSteps(tileMap, currentActingPlayer, enemyPosition, characterAnimationPhaseEnded)
            }
        } 

        // Init the function
        await findXandY()
    }

    /**
     * Randomly decide x and y
     */
    async #randomSteps(tileMap, currentActingPlayer, enemyPosition, characterAnimationPhaseEnded){

        const row =  Math.floor( Math.random() * this.selectableSpace.length)
        console.log("row :>>>", row)
        const col = Math.floor( Math.random() * this.selectableSpace[row].length)
        console.log("col :>>>", col)

        if(this.selectableSpace[row][col][0] === enemyPosition.row && this.selectableSpace[row][col][1] === enemyPosition.col){
            // Spend an action point
            characterAnimationPhaseEnded()                       
        }else{
            // Go to the random selected position
            this.reachableDirections = await prepareDirections(tileMap, enemyPosition, { row: this.selectableSpace[row][col][0], col: this.selectableSpace[row][col][1] }, this.reachableDirections)
            console.log("reachableDirections :>>>", this.reachableDirections)
            
            if(this.reachableDirections.length){
                // Start moving
                currentActingPlayer.setWalkableSpace(this.selectableSpace)
                this.#beginAnimationPhase(currentActingPlayer, characterAnimationPhaseEnded)  
            }else{
                // Spend an action point
                characterAnimationPhaseEnded()
            }
        } 
    }
}
