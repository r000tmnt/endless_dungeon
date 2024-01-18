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

            // If the required resource is enough and equip with the weapon that the skill needs
            if(currentActingPlayer.attributes[skillData.cost.attribute] >= skillData.cost.value && 
               currentActingPlayer.equip.hand?.id.includes(skillData.weapon) ||
               skill.weapon === 'none'
            ){
                skill.addEventListener('click', async() => {
                    // Keep the skill
                    this.selectedSkill = skillData
                    // Get skill effect range
                    this.selectableSpace = await getAvailableSpace(tileMap, playerPosition, skillData.effect.range)
                    // Close skill window
                    skillWindow.classList.add('invisible')
                    
                    setTimeout(() => {
                        this.clearSkillWindow()
                    }, 300)
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

    async #checkIfInRange(row, col,) {
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

    async enemyMove(tileMap, enemy, moveSpeed, enemyPosition, playerPosition, characterAnimationPhaseEnded){
        this.mode = 'move'
        // get walkable space
        await this.setMove(tileMap, enemyPosition, moveSpeed, playerPosition)

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
            console.log('shortest :>>>', allDistance[shortest])
            this.reachableDirections = await prepareDirections(tileMap, enemyPosition, { row: allDistance[shortest].y, col: allDistance[shortest].x }, this.reachableDirections)

            console.log("reachableDirections :>>>", this.reachableDirections)

            if(this.reachableDirections.length){
                // Start moving
                enemy.setWalkableSpace(this.selectableSpace)
                this.#beginAnimationPhase(enemy, characterAnimationPhaseEnded)  
            }else{
                // Spend an action point
                characterAnimationPhaseEnded()  
            }                   
        }else{
            console.log('Player out of reach')

            await this.#randomSteps(tileMap, enemy, enemyPosition, characterAnimationPhaseEnded)
        }  
    }

    async enemyAction(enemy){
        const possibleActions = [{ name: 'attack', value: 50 }, { name: 'skill', value: 50 }, { name: 'stay', value: 30 }]

        possibleActions.forEach(a => {
            if(a.name === enemy.prefer_action){
                a.value += 100
            }
        })

        const totalRate = possibleActions.reduce((accu, current) => accu + current.value, 0)

        for(let i=0; i < possibleActions.length; i++){
            possibleActions[i].value = possibleActions[i].value / totalRate
        }

        // Sort in ascending order for accuracy
        possibleActions.sort((a, b) => a.value - b.value)

        console.log('possible action :>>>', possibleActions)

        const random = Math.random()

        let actionToTake = {}

        for(let i=0; i < possibleActions.length; i++){
            if(random <= possibleActions[i].value){
                actionToTake = possibleActions[i]
                break
            }
        }

        return !Object.entries(actionToTake).length? possibleActions[0] : actionToTake
    }

    async enemyMakeDecision(canvas, tileMap, enemyPosition, moveSpeed, sight, playerPosition, enemy, player, characterAnimationPhaseEnded) {
        this.mode = 'search'

        const { row, col } = playerPosition

        this.selectableSpace = await getAvailableSpace(tileMap, enemyPosition, sight)

        let playerDetect = await this.#checkIfInRange(row, col)
            
        if(playerDetect){
            console.log('enemyAI found player') 

            // let attackRange = 1 
            let possibleAction = await this.enemyAction(enemy)

            this.mode = possibleAction.name

            console.log('enemy take action :>>>', this.mode)

            switch(possibleAction.name){
                case 'attack': {
                    this.selectableSpace = await getAvailableSpace(tileMap, enemyPosition, 1)

                    const actable = await this.command(canvas, row, col, enemy, player, playerPosition, enemy.tileSize, tileMap, characterAnimationPhaseEnded)

                    if(!actable){
                        // Move
                        await this.enemyMove(tileMap, enemy, moveSpeed, enemyPosition, playerPosition, characterAnimationPhaseEnded)
                    }
                }
                break;
                case 'skill':{
                    // Collect skill that fits the requiremnet
                    const useableSkills = enemy.skill.map(s => {
                        const skillData = skills.getOne(s)
                        if(skillData.weapon === 'none'){
                            return skillData                      
                        }
                        
                        if(enemy.attributes[s.cost.attribute] >= skillData.cost .value && enemy.equip?.hand?.id.includes(skillData.weapon)){
                            return skillData
                        }
                    })

                    // Calaculate Each use rate
                    const skillUseRate = useableSkills.map(s => {
                        return { name: s.id, value: (enemy.prefer_skill_type === s.weapon)? 80 : 50}
                    })

                    // Combine numbers
                    const totalRate = skillUseRate.reduce((accu, current) => accu + current.value, 0)

                    for(let i=0; i < skillUseRate.length; i++){
                        skillUseRate[i].value = skillUseRate[i].value / totalRate
                    }
            
                    // Sort in ascending order for accuracy
                    skillUseRate.sort((a, b) => a.value - b.value)
            
                    console.log('possible skill :>>>', skillUseRate)

                    const finalDicision = skillUseRate[Math.floor(Math.random() * skillUseRate.length)]

                    // Get skill effect range
                    this.selectableSpace = await getAvailableSpace(tileMap, enemyPosition, finalDicision.effect.range)

                    const actable = await this.command(canvas, row, col, enemy, player, playerPosition, enemy.tileSize, tileMap, characterAnimationPhaseEnded)

                    if(!actable){
                        // Move
                        await this.enemyMove(tileMap, enemy, moveSpeed, enemyPosition, playerPosition, characterAnimationPhaseEnded)
                    }
                }
                break;
                case 'stay':
                    // Spend an action point
                    characterAnimationPhaseEnded()  
                break;
            }
        }else{
            console.log('enemyAI can not find the player')
            // Move
            await this.enemyMove(tileMap, enemy, moveSpeed, enemyPosition, playerPosition, characterAnimationPhaseEnded)
        }
    }

    /**
     * Randomly decide x and y
     */
    async #randomSteps(tileMap, enemy, enemyPosition, characterAnimationPhaseEnded){

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
                enemy.setWalkableSpace(this.selectableSpace)
                this.#beginAnimationPhase(enemy, characterAnimationPhaseEnded)  
            }else{
                // Spend an action point
                characterAnimationPhaseEnded()
            }
        } 
    }
}
