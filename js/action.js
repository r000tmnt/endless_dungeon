import { prepareDirections, getDistance, getAvailableSpace } from './utils/pathFinding.js';
import { skillAttack, weaponAttack, gainExp } from './utils/battle.js';
import skills from './dataBase/skills.js';
import skill_type from './dataBase/skill/skill_type.js';
import setting from './utils/setting.js';
import { resizeHiddenElement } from './utils/ui.js'
import { useItem } from './utils/inventory.js'
import game from './game.js';
import { t } from './utils/i18n.js';

export default class Action{
    constructor(mode, selectableSpace, reachableDirections, steps, animationInit){
        this.mode = mode
        this.selectableSpace = selectableSpace
        this.reachableDirections = reachableDirections
        this.steps = steps
        this.animationInit = animationInit
        this.messageConfig = {
            message: '',
            style: '',
            size: 0,
        },
        this.selectedSkill = {}
        this.target = {}
    }

    /**
     * Prepare walkable space
     * @param {object} tileMap - An object represent the tile map
     * @param {object} player - An object represent the current acting player
     * @param {object} playerPosition - An object represent player's position
     * @param {number} moveSpeed - A number indicated the amount of blocks for each direction in straight line  
     * @param {Array} enemyPosition - An array represent enemy's position
     */
    async setMove(tileMap, player, playerPosition, moveSpeed, enemyPosition){
        this.selectableSpace = await getAvailableSpace(tileMap, playerPosition, moveSpeed, enemyPosition)
        player.setWalkableSpace(this.selectableSpace)
        console.log("playerWalkableSpace : >>>", this.selectableSpace)  
    }

    /**
     * Prepare a range of blocks for attack
     * @param {object} tileMap - An object represent the tile map
     * @param {object} player - An object represent the current acting player
     * @param {object} playerPosition - An object represent player's position
     * @param {number} attackRange - A number indicated the amount of blocks for each direction in straight line  
     */
    async setAttack(tileMap, player, playerPosition, attackRange){
        this.selectableSpace = await getAvailableSpace(tileMap, playerPosition, attackRange)
        player.setWalkableSpace(this.selectableSpace)
    }

    clearSkillWindow(target){
        const skillList = document.querySelector('.learned-skills')
        while(skillList.firstChild){
            skillList.removeChild(skillList.firstChild)
        }

        resizeHiddenElement(target, 0, 0, 0)
    }

    resizeSkillWindow(fontSize, fontSize_md, fontSize_sm, tileSize){
        const skillList = document.querySelector('.learned-skills')
        const skills = document.querySelectorAll('.skill')
        const title = document.getElementById('skill').children[0]

        const { itemBlockSize } = setting.inventory
        title.style.fontSize = fontSize + 'px'

        skillList.style.maxHeight = (itemBlockSize * 3) + 'px'

        skills.forEach(skill => {
            skill.style.fontSize = fontSize_md + 'px'
            skill.style.padding = `${fontSize_sm}px` 
            skill.children[0].style.width = tileSize + 'px'
            skill.children[0].style.height = tileSize + 'px'
            skill.children[0].style.marginRight = `${fontSize_sm}px`
        })
    }

    // TODO: Skill menu
    setSKillWindow(currentActingPlayer, tileMap, playerPosition, fontSize, fontSize_md, fontSize_sm){
        const skillWindow = document.getElementById('skill')
        const skillTypes = skill_type.getAll()
        const title = skillWindow.children[0]
        const skillList = document.querySelector('.learned-skills')
        const { itemBlockSize } = setting.inventory

        skillList.style.maxHeight = (itemBlockSize * 3) + 'px'
        title.innerText = t("ui.action.skill")
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
            skill.style.fontSize = fontSize_md + 'px'
            skill.style.boxSizing = 'border-box'
            skill.style.padding = `${fontSize_sm}px`  

            skillIcon.style.width = tileMap.tileSize + 'px'
            skillIcon.style.height = tileMap.tileSize + 'px'
            skillIcon.style.marginRight = `${fontSize_sm}px`
            skillIcon.classList.add('icon')

            skillName.innerText = t(`skill.${skillData.id}.name`)
            skillCost.innerText = `${skillData.cost.attribute}: ${skillData.cost.value}`
            skillDesc.innerText = t(`skill.${skillData.id}.desc`)

            skillLabel.classList.add('flex')
            skillLabel.style.justifyContent = 'space-between'
            skillLabel.append(skillName)
            skillLabel.append(skillCost)

            skillInfo.append(skillLabel)
            skillInfo.append(skillDesc)
            skillInfo.style.width = '100%'

            // If the required resource is enough and equip with the weapon that the skill needs
            if(currentActingPlayer.totalAttribute[skillData.cost.attribute] >= skillData.cost.value && 
               currentActingPlayer.equip.hand?.id.includes(skillTypes[skillData.type]) ||
               skillTypes[skillData.type] === 'none' || skillTypes[skillData.type] === 'status'
            ){
                skill.addEventListener('click', async() => {
                    // Keep the skill
                    this.selectedSkill = skillData
                    // Get skill effect range
                    this.selectableSpace = await getAvailableSpace(tileMap, playerPosition, skillData.effect.range)
                    // Keep the array for refernce
                    currentActingPlayer.setWalkableSpace(this.selectableSpace)
                    // Close skill window
                    skillWindow.classList.add('invisible')
                    
                    setTimeout(() => {
                        this.clearSkillWindow(skillWindow.style)
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

        skillWindow.classList.remove('invisible')
        skillWindow.classList.add('open_window')
    }

    resizeStatusWindow(){
        const statusWindow = document.getElementById('status')
        const statusInfo = document.getElementById('info')
        const statusTable = statusWindow.children[3]
        const { fontSize, fontSize_md, fontSize_sm } = setting.general
        const statusToggle = document.querySelectorAll('.attribute-toggle')

        statusWindow.style.fontSize = fontSize + 'px'
        statusTable.style.fontSize = fontSize_md + 'px'
        // statusTable.style.maxHeight = (statusTable.clientHeight - (height - statusTable.clientHeight)) + 'px'
        statusInfo.style.fontSize = fontSize_md + 'px' 
        
        for(let i=0; i < statusToggle.length; i++){
            statusToggle[i].children[0].style.margin = `0 ${fontSize_sm}px`
            statusToggle[i].children[0].style.padding = `0 ${fontSize_sm / 2}px`
            statusToggle[i].children[1].style.margin = `0 ${fontSize_sm}px`
            statusToggle[i].children[1].style.padding = `0 ${fontSize_sm / 2}px`
        }
    }

    resetStatusWindow(target){
        const statusToggle = document.querySelectorAll('.attribute-toggle')
        statusToggle.forEach(t => t.classList.add('invisible'))

        resizeHiddenElement(target, 0, 0, 0)
    }

    /**
     * Lock all of the + button
     * @param {HTMLCollection} statusToggle - A collection of HTMLElement contains both minus and plus button
     */
    lockPlusToggle(statusToggle){
        statusToggle.forEach(t => t.children[1].classList.add('button_disable'))
    }

    /**
     * Unlock all of thr + button
     * @param {HTMLCollection} statusToggle - A collection of HTMLElement contains both minus and plus button
     */
    unLockPlusToggle(statusToggle){
        statusToggle.forEach(t => t.children[1].classList.remove('button_disable'))
    }

    /**
     * Lock all of the - button
     * @param {HTMLCollection} statusToggle - A collection of HTMLElement contains both minus and plus button
     */
    lockMinusToggle(statusToggle){
        statusToggle.forEach(t => t.children[0].classList.add('button_disable'))
    }

    /**
     * Alter status number on the screen
     * @param {object} inspectingCharacter - An object represend current acting player
     * @param {number} attribute - A number of the stat to change 
     * @param {HTMLCollection} tableNode - A collection of HTMLElement contains a list of character status
     */
    alterStatusList(inspectingCharacter, attribute, tableNode){
        const index = tableNode.findIndex(t => attribute.toLowerCase().includes(t.dataset.attribute))

        switch(attribute){
            case 'maxHp':
                tableNode[index].innerText = `${inspectingCharacter.totalAttribute.hp} / ${inspectingCharacter.totalAttribute.maxHp}`
            break;
            case 'maxMp':
                tableNode[index].innerText = `${inspectingCharacter.totalAttribute.mp} / ${inspectingCharacter.totalAttribute.maxMp}`
            break;
            default:
                tableNode[index].innerText = `${inspectingCharacter.totalAttribute[attribute]}`
            break;
        }
    }

    /**
     * Set text information for status dialog
     * @param {object} inspectingCharacter - A set of data about the inspecting character 
     */
    setStatusWindow(inspectingCharacter, fontSize, fontSize_md, fontSize_sm, width){
        const statusWindow = document.getElementById('status')
        const statusInfo = document.getElementById('info')
        const statusLv = statusWindow.children[2].children[0]
        const statusPt = statusWindow.children[2].children[1]
        const statusTable = statusWindow.children[3]
        const tableNode = statusTable.querySelectorAll('.status-node')
        const avatar = document.getElementById('avatar')

        statusWindow.style.fontSize = fontSize + 'px'
        statusInfo.style.fontSize = fontSize_md + 'px' 
        statusInfo.children[0].innerText = inspectingCharacter.name
        statusInfo.children[1].innerText = t(`job.${inspectingCharacter.class_id}`)
        statusLv.innerText = `Lv ${inspectingCharacter.lv}`
        statusPt.innerText = `Pt: ${inspectingCharacter.pt}`
        statusTable.style.fontSize = fontSize_md + 'px'
        avatar.style.width = Math.floor(width * 0.3) + 'px';
        avatar.style.height = Math.floor(width * 0.3) + 'px';

        for(let i=0; i < tableNode.length; i++){
            switch(tableNode[i].dataset.attribute){
                case 'hp':
                    tableNode[i].innerText = `${inspectingCharacter.totalAttribute.hp} / ${inspectingCharacter.totalAttribute.maxHp}`
                break;
                case 'mp':
                    tableNode[i].innerText = `${inspectingCharacter.totalAttribute.mp} / ${inspectingCharacter.totalAttribute.maxMp}`
                break;
                case 'ap':
                    tableNode[i].innerText = `${inspectingCharacter.totalAttribute.ap} / ${inspectingCharacter.totalAttribute.maxAp}`
                break;
                case 'exp':
                    tableNode[i].innerText = `${inspectingCharacter.exp? inspectingCharacter.exp : 0 } / ${inspectingCharacter.requiredExp? inspectingCharacter.requiredExp : 0}`
                break;
                case 'status':
                    if(inspectingCharacter.status.length){
                        inspectingCharacter.status.map(s => {
                            tableNode[i].innerHTML += `${s.name} `
                        })
                    }else{
                        tableNode[i].innerText = 'Healty'
                    }
                break;
                default:
                    tableNode[i].innerText = `${inspectingCharacter.totalAttribute[`${tableNode[i].dataset.attribute}`]}`
                break;
            }
        }

        // If there're points to spend
        if(inspectingCharacter.pt > 0){
            const statusToggle = document.querySelectorAll('.attribute-toggle')

            for(let i=0; i < statusToggle.length; i++){
                statusToggle[i].style.fontSize = fontSize_md + 'px'
                statusToggle[i].classList.remove('invisible')
                const attr = statusToggle[i].dataset.attribute
                if(attr !== undefined){
                    // minus
                    const minusBtn = statusToggle[i].children[0]
                    minusBtn.classList.add('button_disable')
                    minusBtn.addEventListener('click', () => {
                        inspectingCharacter.totalAttribute[attr] -= 1
                        inspectingCharacter.base_attribute[attr] -= 1
                        inspectingCharacter.pt += 1
                        statusPt.innerText = `Pt: ${inspectingCharacter.pt}`

                        // Change the number on the screen
                        this.alterStatusList(inspectingCharacter, attr, Array.from(tableNode))

                        if(inspectingCharacter.pt === 5){
                            this.lockMinusToggle(statusToggle)
                        }

                        if(inspectingCharacter.pt === 1){
                            this.unLockPlusToggle(statusToggle)
                        }
                    })

                    minusBtn.style.margin = `0 ${fontSize_sm}px`
                    minusBtn.style.padding = `0 ${fontSize_sm / 2}px`

                    // plus
                    const plusBtn = statusToggle[i].children[1]
                    plusBtn.addEventListener('click', () => {
                        inspectingCharacter.totalAttribute[attr] += 1
                        inspectingCharacter.base_attribute[attr] += 1
                        inspectingCharacter.pt -= 1
                        statusPt.innerText = `Pt: ${inspectingCharacter.pt}`
                        minusBtn.classList.remove('button_disable')

                        // Change the number on the screen
                        this.alterStatusList(inspectingCharacter, attr, Array.from(tableNode))

                        if(inspectingCharacter.pt === 0){
                            this.lockPlusToggle(statusToggle)
                        }
                    })

                    plusBtn.style.margin = `0 ${fontSize_sm}px`
                    plusBtn.style.padding = `0 ${fontSize_sm / 2}px`
                }
            }
        }

        statusWindow.classList.remove('invisible')
        statusWindow.classList.add('open_window')
    }

    setFontSize(size){
        this.messageConfig.size = size
    }

    setSelectableSpace(space){
        this.selectableSpace = space
    }

    /**
     * Get walkable directions and start moving
     * @param {object} tileMap - An object represent the tile map
     * @param {number} row - A number indicates which row ( y axis ) is user pointed
     * @param {number} col - A number indicates which col ( x axis ) is user pointed
     * @param {object} playerPosition - An object contains the row and col position of the current acting player 
     * @param {object} currentActingPlayer - An onbject contains the information about the current acting character
     * @returns {boolean} A value represend the state of pointed block is ib the range or not
     */
    async move(tileMap, row, col, playerPosition, currentActingPlayer){
        const inRange = await this.#checkIfInRange(row, col)

        if(inRange){
            game.actionSelectSound.element.play()
            currentActingPlayer.totalAttribute.ap -= 1
            this.reachableDirections = await prepareDirections(tileMap, playerPosition, { row, col }, this.reachableDirections)
            // characterCaption.classList.remove('visible')

            currentActingPlayer.setWalkableSpace(this.selectableSpace)  

            // Start moving
            // Maybe I need a global variable to track the steps...
            this.beginAnimationPhase(currentActingPlayer)
        }else{
            this.selectableSpace.splice(0)
            currentActingPlayer.setWalkableSpace([])
        }

        return inRange
    }
    
    async command(canvas, row, col, player, enemy, enemyPosition, tileSize, tileMap){
        const inRange = await this.#checkIfInRange(row, col)

        if(inRange){
            this.selectableSpace.splice(0)
            this.animationInit = true
            
            if(this.mode === 'item'){
                player.totalAttribute.ap -= 1
                // player.animation = 'item'
                const { message, type } = useItem(player)

                this.#displayMessage(canvas, message, this.messageConfig.size, (type === 0)? 'rgb(0, 255, 0)' : 'yellow', player.x, player.y - tileSize)   
            }else{
                if(enemyPosition.findIndex(e => e.row === row && e.col === col) >= 0){
                    let { message, style, size} = this.messageConfig 

                    const horizontalLine = Math.floor(9 / 2)
                    const verticalLine = 16 / 2
    
                    const offsetX = (horizontalLine - col) * tileSize
                    const offsetY = (verticalLine - row) * tileSize  
    
                    canvas.style.transform = `scale(1.5) translate(${offsetX}px, ${offsetY}px)`
    
                    console.log('clear selectable :>>>', this.selectableSpace)
    
                    switch(this.mode){
                        case 'attack':{
                            player.animation = 'attack'
                            player.totalAttribute.ap -= 1
                            const { resultMessage, resultStyle } = await weaponAttack(player, enemy)
                            message += resultMessage
                            style = resultStyle
                        }
                        break;
                        case 'skill':{
                            player.animation = this.selectedSkill.animation
                            const skillName = document.getElementById('skillName').children[0]
                            const { attribute, value } = this.selectedSkill.cost
                            player.totalAttribute[attribute] -= value
                            player.totalAttribute.ap -= 2
    
                            const { resultMessage, resultStyle  } = await skillAttack(this.selectedSkill, player, enemy)

                            skillName.innerText = this.selectedSkill.name;
                            skillName.style.fontSize = size + 'px'
                            skillName.style.padding = Math.floor(size / 2) + 'px'
                            skillName.classList.remove('invisible')
                            skillName.style.opacity = 1
    
                            message = resultMessage
                            style = resultStyle
                        }
                        break;
                    }
    
                    if(message.includes(',')){
                        message = message.split(',')
    
                        message.forEach(msg => {
                            setTimeout(() => {
                                this.#displayMessage(canvas, msg, size, style, Math.floor((tileSize * 9) / 2) - tileSize, Math.floor((tileSize * 16) / 2) - tileSize,) 
                            }, 300)
                        })
                    }else{
                        setTimeout(() => {  
                            this.#displayMessage(canvas, message, size, style, Math.floor((tileSize * 9) / 2) - tileSize, Math.floor((tileSize * 16) / 2) - tileSize)  
                        }, 300)
                    }
                }
            }

            // Wait for damage animation to finish
            setTimeout(async() => {
                player.animation = 'idle'
                enemy.animation = 'idle'
                // Check if the enemy is defeated
                if(enemy.totalAttribute.hp <= 0){

                    // Calculate item drop rate
                    if(player.type === 2){
                        gainExp(player, enemy)

                        // Sort in ascending order for accuracy
                        enemy.drop.sort((a, b) => a.rate - b.rate)

                        // Apply luck bonus to the lowest drop rate
                        enemy.drop[0].rate += Math.floor(enemy.drop[0].rate * (player.totalAttribute.lck / 100) )
                    
                        const totalDropRate = enemy.drop.reduce((accu, current) => accu + current.rate, 0)

                        console.log('totol drop rate :>>>', totalDropRate)
        
                        enemy.drop.forEach(item => {
                            item.rate = item.rate / totalDropRate
                        });
        
                        console.log('Each drop rate :>>>', enemy.drop)
        
                        // Multiply with luck
                        const randomDrop = Math.random()
        
                        console.log('init random drop :>>>', randomDrop)
        
                        let dropItems = enemy.drop.filter(item => randomDrop <= item.rate)
        
                        console.log('random item drop :>>>', dropItems)
        
                        // Leave the item on the ground
                        if(dropItems.length){
                            dropItems = await game.checkDroppedItem(dropItems)
        
                            game.tileMap.setEventOnTile({x: enemy.x, y: enemy.y}, dropItems)
                        }else{
                            // At least drop a key to continue the game
                            game.tileMap.setEventOnTile({x: enemy.x, y: enemy.y}, [
                                {
                                    amount: 1,
                                    id: "key_dark_1",
                                    type: 6
                                }
                            ])
                        }

                        game.tileMap.changeTile(parseInt(enemy.y / tileSize), parseInt(enemy.x / tileSize), 4)
                    }else{
                        // If player lose, drop all items
                        if(enemy.bag.length){
                            game.tileMap.setEventOnTile({x: enemy.x, y: enemy.y}, enemy.bag)
                            game.tileMap.changeTile(parseInt(enemy.y / tileSize), parseInt(enemy.x / tileSize), 4)
                        }

                        // Need to change the timing to check on objective
                        const enemyFadeOutWatcher = setInterval(() => {
                            if(!enemy.isMoving){
                                game.characterAnimationPhaseEnded(player)
                                clearInterval(enemyFadeOutWatcher)
                            }
                        }, 100)
                        
                    }
                }else{
                    game.characterAnimationPhaseEnded(player)
                }
            }, 1500)
        }else{
            this.selectableSpace.splice(0)
            player.setWalkableSpace([])
        }

        return inRange
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
     */
    beginAnimationPhase(currentActingPlayer) {
        console.log('step :>>>', this.steps)

        // Waiting for the animation to end 
        // If animation ended
        if(!this.animationInit) {
            if(this.steps > (this.reachableDirections.length - 1)){
                console.log('Step finished')
                // Finish the phase
                // Reset steps
                this.steps = 0

                // Reset animation
                currentActingPlayer.animation = 'idle'

                // Clear the array
                this.selectableSpace.splice(0)

                this.reachableDirections.splice(0)

                game.characterAnimationPhaseEnded(currentActingPlayer)
            }else{
    ``            // Take step
                this.animationInit = true
                currentActingPlayer.setDestination({row: this.reachableDirections[this.steps][0], col: this.reachableDirections[this.steps][1]})  

                // Point to the next step
                this.steps += 1      
            }

        }else{
            console.log('watching animation')
        }
    }

    // Text information about damage, heal, poisoned... etc
    #displayMessage(canvas, message, size, style, x, y) {
        const appWrapper = document.getElementById('wrapper')
        const skillName = document.getElementById('skillName').children[0]

        const messageHolder = document.createElement('span')
        messageHolder.setAttribute('data-message', message) 
        messageHolder.style.opacity = 1
        messageHolder.style.fontSize = (size / 2) + 'px'
        document.documentElement.style.setProperty('--fontSize', (size / 2) + 'px')
        document.documentElement.style.setProperty('--msgColor', style)
        messageHolder.style.fontWeight = 'bold'
        // messageHolder.style.color = style
        messageHolder.style.textAlign = 'center'
        messageHolder.style.position = 'absolute',
        messageHolder.style.top = y + 'px'
        messageHolder.style.left = x + 'px'
        messageHolder.style.transition = 'all .5s ease-in-out'
        appWrapper.append(messageHolder)

        // Mwssage animation
        messageHolder.classList.add('statusMessage');
        
        // Clear message
        setTimeout(() => {
            if(this.mode === 'skill'){
                skillName.style.opacity = 0
            }
            messageHolder.style.opacity = 0
            canvas.style.transform = `unset`

            setTimeout(() => {
                if(this.mode === 'skill'){
                    skillName.classList.add('invisible')              
                }
                messageHolder.remove()
                this.animationInit = false
            }, 500)            
        }, 1000)
    }

    async enemyMove(tileMap, enemy, moveSpeed, enemyPosition, playerPosition){
        this.mode = 'move'
        enemy.totalAttribute.ap -= 1 
        // get walkable space
        await this.setMove(tileMap, enemy, enemyPosition, moveSpeed, playerPosition)

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
                enemy.animationFrame = 0
                enemy.frameTimer = 0
                enemy.setWalkableSpace(this.selectableSpace)
                this.beginAnimationPhase(enemy)  
            }else{
                // Spend an action point
                game.characterAnimationPhaseEnded()  
            }                   
        }else{
            console.log('Player out of reach')

            await this.#randomSteps(tileMap, enemy, enemyPosition)
        }  
    }

    async enemyAction(enemy){
        const possibleActions = (enemy.totalAttribute.ap < 2)? [{ name: 'attack', value: 50 }, { name: 'stay', value: 30 }] : [{ name: 'attack', value: 50 }, { name: 'skill', value: 50 }, { name: 'stay', value: 30 }]

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

    async enemyMakeDecision(canvas, tileMap, enemyPosition, moveSpeed, sight, playerPosition, enemy, player) {
        this.mode = 'search'
        let playerInRange = []
        this.selectableSpace = await getAvailableSpace(tileMap, enemyPosition, sight)

        for(let i=0; i < playerPosition.length; i++){
            const { row, col } = playerPosition[i]
            if(await this.#checkIfInRange(row, col)){
                playerInRange.push(player.find(p => row === parseInt(p.y / tileMap.tileSize) && parseInt(p.x / tileMap.tileSize)))
            }
        }
            
        if(playerInRange.length){
            console.log('enemyAI found player') 

            playerInRange.sort((a, b) => b.totalAttribute.def - a.totalAttribute.def)

            // Chose the player with the lowest def
            const targetPlayerPosition = {
                row: parseInt(playerInRange[0].y / tileMap.tileSize),
                col: parseInt(playerInRange[0].x / tileMap.tileSize)
            }

            // let attackRange = 1 
            let possibleAction = await this.enemyAction(enemy)

            this.mode = possibleAction.name

            console.log('enemy take action :>>>', this.mode)

            switch(possibleAction.name){
                case 'attack': {
                    this.selectableSpace = await getAvailableSpace(tileMap, enemyPosition, 1)

                    const actable = await this.command(canvas, targetPlayerPosition.row, targetPlayerPosition.col, enemy, playerInRange[0], playerPosition, enemy.tileSize, tileMap)

                    if(!actable){
                        // Move
                        await this.enemyMove(tileMap, enemy, moveSpeed, enemyPosition, playerPosition)
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
                        
                        if(enemy.totalAttribute[s.cost.attribute] >= skillData.cost .value && enemy.equip?.hand?.id.includes(skillData.weapon)){
                            return skillData
                        }
                    })

                    // Calaculate Each use rate
                    const skillUseRate = useableSkills.map(s => {
                        return {...s, value: (enemy.prefer_skill_type === s.weapon)? 80 : 50}
                    })

                    // Combine numbers
                    const totalRate = skillUseRate.reduce((accu, current) => accu + current.value, 0)

                    for(let i=0; i < skillUseRate.length; i++){
                        skillUseRate[i].value = skillUseRate[i].value / totalRate
                    }
            
                    // Sort in ascending order for accuracy
                    skillUseRate.sort((a, b) => a.value - b.value)
            
                    console.log('possible skill :>>>', skillUseRate)

                    const random = Math.random()

                    for(let i=0; i< skillUseRate.length; i++){
                        if(random <= skillUseRate[i].value){
                           this.selectedSkill = skillUseRate[i]
                           break 
                        }
                    }

                    // Get skill effect range
                    this.selectableSpace = await getAvailableSpace(tileMap, enemyPosition, this.selectedSkill.effect.range)

                    const actable = await this.command(canvas, targetPlayerPosition.row, targetPlayerPosition.col, enemy, playerInRange[0], playerPosition, enemy.tileSize, tileMap)

                    if(!actable){
                        // Move
                        await this.enemyMove(tileMap, enemy, moveSpeed, enemyPosition, playerPosition)
                    }
                }
                break;
                case 'stay':
                    // Spend an action point
                    enemy.totalAttribute.ap -= 1
                    game.characterAnimationPhaseEnded(enemy)  
                break;
            }
        }else{
            console.log('enemyAI can not find the player')
            // Move
            await this.enemyMove(tileMap, enemy, moveSpeed, enemyPosition, playerPosition)
        }
    }

    /**
     * Randomly decide x and y
     */
    async #randomSteps(tileMap, enemy, enemyPosition){

        const row =  Math.floor( Math.random() * this.selectableSpace.length)
        console.log("row :>>>", row)
        const col = Math.floor( Math.random() * this.selectableSpace[row].length)
        console.log("col :>>>", col)

        if(this.selectableSpace[row][col][0] === enemyPosition.row && this.selectableSpace[row][col][1] === enemyPosition.col){
            // Spend an action point
            game.characterAnimationPhaseEnded()                       
        }else{
            // Go to the random selected position
            this.reachableDirections = await prepareDirections(tileMap, enemyPosition, { row: this.selectableSpace[row][col][0], col: this.selectableSpace[row][col][1] }, this.reachableDirections)
            console.log("reachableDirections :>>>", this.reachableDirections)
            
            if(this.reachableDirections.length){
                // Start moving
                enemy.setWalkableSpace(this.selectableSpace)
                this.beginAnimationPhase(enemy)  
            }else{
                // Spend an action point
                game.characterAnimationPhaseEnded(enemy)
            }
        } 
    }
}
