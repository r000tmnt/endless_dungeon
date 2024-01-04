import { prepareDirections, getDistance, getAvailableSpace } from './utils/pathFinding.js';
import { weaponAttack } from './utils/battle.js';

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
        }
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

    // TODO: Skill menu
    setSKillWindow(){}

    /**
     * Set inventory style and display it
     * @param {object} currentActingPlayer - An object represent the current acting player 
     * @param {object} canvasPosition - An object contains information about the canvas 
     * @returns 
     */
    async setInventoryWindow(currentActingPlayer, canvasPosition){
        const Inventory = document.getElementById('item')
        const space = document.getElementById('inventory')
        for(let i=0; i < currentActingPlayer.bag.length; i++){
            const item = document.createElement('div')
            const itemCount = document.createElement('div')
            let requestUrl = ''
            
            // Set item data url from type
            switch(currentActingPlayer.bag[i].type){
                case 0:
                    requestUrl = '../assets/data/item/item_potion.json'
                break;
                case 1:
                break;
                case 2:
                break;
                case 3:
                    requestUrl = '../assets/data/item/item_weapon.json'
                break;
                case 4:
                    requestUrl = '../assets/data/item/item_armor.json'
                break;
                case 5:
                break;
                case 6:
                break;
            }

            // Get item data
            const response = await fetch(requestUrl)

            try {
                const result = await response.json()
                console.log(result)
                console.log(typeof result)
        
                const items = Object.values(result)
        
                console.log(items)
        
                // Set inner text with item data
                for(let j=0; j < items.length; j++){
                    if(items[j].id === currentActingPlayer.bag[i].id){
                        item.innerText = items[j].name
                        itemCount.innerText = currentActingPlayer.bag[i].amount
                        break
                    }
                }
        
                console.log(item)       
                
                // Set the size of each block
                const itemBlockSize = Math.floor(canvasPosition.width / 100) * 33
                const itemBlockMargin = Math.floor((itemBlockSize / 100) * 10)

                // Apply size number
                // itemCount.style.position = 'absolute'
                itemCount.style.width = 'fit-content'
                itemCount.classList.add('item-count')

                item.style.width = itemBlockSize + 'px'
                item.style.height = itemBlockSize + 'px'

                // If the index is the middle column
                if(((i + (i+1)) % 3) === 0){
                    item.style.margin = `0 ${itemBlockMargin}px`
                }
                
                item.classList.add('item')

                space.style.padding = itemBlockMargin + 'px'

                // Appen child to element
                item.append(itemCount)
                space.append(item)

                // Display inventory
                Inventory.classList.remove('invisible')
                Inventory.classList.add('open_window')
            } catch (error) {
                console.log(error)
                return error
            }
        }
    }

    /**
     * Set text information for status dialog
     * @param {object} inspectingCharacter - A set of data about the inspacting character 
     */
    setStatusWindow(inspectingCharacter){
        const statusWindow = document.getElementById('status')
        const statusInfo = document.getElementById('info')
        const statusLv = statusWindow.children[2]
        const statusTable = statusWindow.children[3]

        this.mode = 'status'

        const tableNode = statusTable.querySelectorAll('td')

        // Insert status information
        statusInfo.children[0].innerText = inspectingCharacter.name
        statusInfo.children[1].innerText = inspectingCharacter.class
        statusLv.innerText = `LV ${inspectingCharacter.lv}`

        for(let i=0; i < tableNode.length; i++){
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
    
    async attack(row, col, player, enemy, enemyPosition, tileSize, tileMap, characterAnimationPhaseEnded){
        const inRange = await this.#checkIfInRange(row, col)

        if(inRange){
            if(enemyPosition.row === row && enemyPosition.col === col)
                this.animationInit = true
                this.messageConfig.message = await weaponAttack(player, enemy, tileMap, row, col)
                const { message, style, size} = this.messageConfig
                this.#displayMessage(message, size, style,  enemy.x, (enemy.y - tileSize), characterAnimationPhaseEnded)            
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
                break
            }else{
                for(let j=0; j < this.selectableSpace[i].length; j++){
                    if(this.selectableSpace[i][j][0] === row && this.selectableSpace[i][j][1] === col){
                        inRange = true   
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
                    currentActingPlayer.attributes.ap -= 1

                    clearInterval(animationWatcher)

                    characterAnimationPhaseEnded()
                }  
            }else{
                console.log('watching animation')
            }
        }, 100) 
    }

    // Text information about damange, heal, poisoned... etc
    #displayMessage(message, size, style, x, y, characterAnimationPhaseEnded) {
        const appWrapper = document.getElementById('wrapper')
        const messageHolder = document.createElement('span')
        messageHolder.innerText = message
        messageHolder.style.fontSize = size
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
        }, 1000)
    
        // Spend an action point
        setTimeout(() => {
            this.animationInit = false

            if(this.mode === 'attack' || this.mode === 'skill' || this.mode === 'item'){
                this.selectableSpace.splice(0)
                console.log('clear selectable :>>>', this.selectableSpace)
            }

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
                        this.#beginAnimationPhase(currentActingPlayer)  
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
