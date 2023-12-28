// import Character from './Character.js';
import TileMap from './TileMap.js';
import Grid from './grid.js';
// import StatusMessage from './statusMessage.js';

import { prepareDirections, getDistance, getAvailableSpace } from './utils/pathFinding.js';

// #region Canvas element
let canvas = document.getElementById('game');
let ctx = canvas.getContext("2d");

let canvasPosition
let deviceWidth = window.innerWidth
let deviceHeight = window.innerHeight

// Text information about damange, heal, poisoned... etc
// let statusMessage = null
let messageConfig = {
    message: '',
    style: 'yellow',
    size: 0,
}

const phaseWrapper = document.getElementById('Phase_Transition');
const phaseElement = document.getElementById('phase');
// #endregion

// #region Tile map setup
let tileSize = Math.floor(canvas.width / 9);

let tileMap = new TileMap(tileSize)

let grid = new Grid(tileMap.map, tileSize, {})
// console.log(tileMap)
// #endregion

// #region Game logic variables
var turn = 1

// 0 - player
// 1 - enemy
var turnType = 0

var actionMode = ''

var pointedBlock = {}

/** An array to store a range of walkable position
 * [ { row, col }, { row, col }, { row, col }...]
 */
var playerWalkableSpace = []

var playerAttackRange = []

/**
 * An array to store steps in order
 */
var playerReachableDirections = []

var stepCount = 0

// If the character is moving
var animationInit = false

// A exported function for other object to talk to the game engine
export const animationSignal = (signal) => {
    animationInit = signal
}

// #endregion

// #region Game characters
// Character movement speed
let velocity = 1;

// Create player object
let player = null
// console.log('player :>>>', player)
// player.setSkills('slash')
var playerPosition = {
    row: 0,
    col: 0
}

// Create enemy object
let enemy = null
// console.log('enemy :>>>', enemy)
// enemy.setSkills('poison')

var enemyPosition = {
    row: 0,
    col: 0
}

var inspectingCharacter = null
// #endregion

// #region UI element variables and functions
// Get UI element and bind a click event
const appWrapper = document.getElementById('wrapper')
const turnCounter = document.getElementById('turn')
turnCounter.innerText = 'Turn 1'

const actionMenu = document.getElementById('action_menu');

// const actionMenuHolder = actionMenu.getElementByIdy('action_list')
const actionMenuOptions = actionMenu.getElementsByTagName('li')

const characterCaption = document.getElementById('characterCaption')
const characterName = document.getElementById('name')
const characterLv = document.getElementById('lv')
const characterAp = document.getElementById('ap')
const characterCaptionAttributes = ['hp', 'mp']
const gauges = document.querySelectorAll('.gauge')

const statusWindow = document.getElementById('status')
const avatar = document.getElementById('avatar')
const backBtn = document.getElementsByClassName('back')
const statusInfo = document.getElementById('info')
const statusLv = statusWindow.children[2]
const statusTable = statusWindow.children[3]

// Back button click event
for(let i=0; i < backBtn.length; i++){
    switch(backBtn[i].dataset.action){
        case 'status':
            backBtn[i].addEventListener('click', () => {
                actionMode = ''
                statusWindow.classList.add('invisible')
                statusWindow.classList.remove('open_window')
            })
        break;
    }
}

// action menu child clcik event
for(let i=0; i < actionMenuOptions.length; i++){
    switch(actionMenuOptions[i].dataset.action){
        case 'move':
            actionMenuOptions[i].addEventListener('click', async() => {
                actionMode = 'move'
                actionMenu.classList.remove('action_menu_open')
                // Hide the element
                characterCaption.classList.add('invisible')  
                playerWalkableSpace = await getAvailableSpace(tileMap, playerPosition, player.attributes.moveSpeed, enemyPosition)
                console.log("playerWalkableSpace : >>>", playerWalkableSpace)             
            })
        break;
        case 'attack':
            actionMenuOptions[i].addEventListener('click', async() => {
                actionMode = 'attack'
                actionMenu.classList.remove('action_menu_open')
                playerAttackRange = await getAvailableSpace(tileMap, playerPosition, 1)
            })
        break;    
        case 'status':
            actionMenuOptions[i].addEventListener('click', () => {
                actionMode = 'status'

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
                                tableNode[i].innerText = `${inspectingCharacter.exp} / ${inspectingCharacter.requiredExp}`
                            break;
                            default:
                                tableNode[i].innerText = `${inspectingCharacter.attributes[`${tableNode[i].dataset.attribute}`]}`
                            break;
                        }
                    }
                }

                statusWindow.classList.remove('invisible')
                statusWindow.classList.add('open_window')
            })
        break;
        case 'stay':
            actionMenuOptions[i].addEventListener('click', async() => {
                actionMode = 'stay'
                actionMenu.classList.remove('action_menu_open')
                // Hide the element
                characterCaption.classList.add('invisible')

                setTimeout(() => {
                    characterAnimationPhaseEnded(2) 
                }, 500)
            })
    }
}

const displayMessage = (message, size, style, x, y) => {
    const messageHolder = document.createElement('span')
    messageHolder.innerText = message
    messageHolder.style.fontSize = size
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
        characterAnimationPhaseEnded(2)
    }, 1500)
}

// #endregion

const resize = () => {
    console.log('resize')
    // aspect ratio
    const aspectRatio = 9 / 16

    // const deviceWidthToDeviceHeight = deviceWidth / deviceHeight

    deviceWidth = window.innerWidth
    deviceHeight = window.innerHeight

    // canvas.style.width = (deviceHeight * aspectRatio) + 'px'
    // canvas.style.height = deviceHeight + 'px'

    if(deviceHeight <= 768){
        canvas.width = Math.floor(deviceHeight * aspectRatio)
        canvas.height = deviceHeight        
    }else

    if(deviceWidth <= 500){
        canvas.width = deviceWidth
        canvas.height = Math.floor(deviceWidth * (16/9))
    }else{
        canvas.width = Math.floor(deviceHeight * aspectRatio)
        canvas.height = deviceHeight  
    }

    // Set up tile size according to the canvas width
    tileSize = Math.floor(canvas.width / 9);
    tileMap = new TileMap(tileSize)
    grid = new Grid(tileMap.map, tileSize, {})

    // Get the player position relative to the canvas size
    player = tileMap.getPlayer(velocity)
     playerPosition = {
        row: player.y / tileSize,
        col: player.x / tileSize
    }

    enemy = tileMap.getEnemy(velocity)
    enemyPosition = {
        row: enemy.y / tileSize,
        col: enemy.x / tileSize
    }

    //set actionMenu wrapper width and height
    actionMenu.style.width = Math.floor( 40 * Math.floor(canvas.width / 100)) + 'px';

    const fontSize = Math.floor( 10 * Math.floor(canvas.width / 100))

    messageConfig.size = fontSize

    // calculation the percentage of the attribute
    for(let i=0; i < gauges.length; i++){
        // console.log(gauges[i].firstElementChild)
        gauges[i].firstElementChild.style.height = (fontSize / 2) + 'px';
    }

    // action menu child font size
    for(let i=0; i < actionMenuOptions.length; i++){
        actionMenuOptions[i].style['font-size'] = fontSize + 'px';
    }

    characterName.style['font-size'] = fontSize + 'px';

    phaseWrapper.style.width = (canvas.width -5) + 'px';
    phaseWrapper.style.height = (canvas.height -10) + 'px';
    phaseElement.style['font-size'] = fontSize + 'px';

    statusWindow.style.width = (canvas.width -5)+ 'px';
    statusWindow.style.height = (canvas.height -10) + 'px';
    statusWindow.style.padding = (fontSize / 2) + 'px';

    avatar.style.width = Math.floor( 50 * Math.floor(canvas.width / 100)) + 'px';
    avatar.style.height = Math.floor( 50 * Math.floor(canvas.width / 100)) + 'px';

    for(let i=0; i < backBtn.length; i++){
        backBtn[i].style.transform = `translateX(-${(fontSize / 2) * 3}px)`
        backBtn[i].style.top = (fontSize / 2) + 'px'        
    }

    // Get canvas position after resize
    ctx = canvas.getContext("2d");
    canvasPosition = canvas.getBoundingClientRect();

    console.log('canvas element :>>>', canvas)
    console.log('canvas position :>>>', canvasPosition)
}

// First time drawing the canvas
resize()

// Get the position on the tileMap
const getPosition = (event) => {
    // console.log("tileSize :>>>", tileSize)
    let positionY = event.clientY - canvasPosition.top
    let positionX = event.clientX - canvasPosition.left

    let row = parseInt( positionY / tileSize)
    let col = parseInt( positionX / tileSize)

    return { row, col }
}

// Player gain expirence upon enemy defeated
const gainExp = () => {
    // Remove the enemy on the screen
    player.exp += enemy.givenExp

    if(player.exp >= player.requiredExp){
        levelUp()
    }
}

// Player level up if the exp reached the required amount
const levelUp = () => {
    // Player level up
    // Extend the required exp for the next level
    player.requiredExp += player.requiredExp * 1.5

    // Give player a few points to spend
    player.pt = 5

    const grows = [0, 1, 3, 5,]

    // A list of attributes that are allow to growth on level up
    const attributeList = ['maxHp', 'maxMp', 'str', 'def', 'spd', 'int', 'lck']
    // Randomly apply attributes growth
    for(let key in Object.entries(player.attributes)){
        const allowIndex = attributeList.findIndex(a => a === key)

        if(allowIndex >= 0){
            const randomGrowth = Math.floor(Math.random() * (grows.length -1))
            player.attribute[key] += grows[randomGrowth]
        }
    }
}

// get mouse position and divide by tile size to see where the row and the column it clicked
canvas.addEventListener('mousedown', async(event) =>{
    const { row, col } = getPosition(event)

    // Set pointed block
    pointedBlock = { row, col }
    grid.setPointedBlock(pointedBlock)
    
    // If there are selectable blocks in the array
    if(playerWalkableSpace.length || playerAttackRange.length){

        let selectableSpace = playerWalkableSpace.length? playerWalkableSpace : playerAttackRange
        
        // Not allow to click on the same block
        if(row === playerPosition.row && col === playerPosition.col) return

        let inRange = false
        // Loop through the array find if the position matches
        for(let i=0; i < selectableSpace.length; i++){
            if(inRange){
                break
            }else{
                for(let j=0; j < selectableSpace[i].length; j++){
                    if(selectableSpace[i][j][0] === row && selectableSpace[i][j][1] === col){
                        inRange = true   
                    }
                }
            }
        }

        if(inRange && playerWalkableSpace.length){
            playerReachableDirections = await prepareDirections(tileMap, playerPosition, { row: row, col: col }, playerReachableDirections)

            // Hide the element
            characterCaption.classList.remove('visible')

            player.setWalkableSpace(playerWalkableSpace)  

            // Start moving
            // Maybe I need a global variable to track the steps...
            beginAnimationPhase(stepCount, 2)
        }else
        if(inRange && playerAttackRange.length){
            // Check if there's a target to attack
            if(enemyPosition.row === row && enemyPosition.col === col){
                // Calculate damage and probability
                let LvDistance = 0

                const Rates = [
                    {
                        name: 'hitRate',
                        value: 0
                    },
                    {
                        name: 'evadeRate',
                        value: enemy.attributes.spd + enemy.attributes.def
                    },
                    {
                        name: 'criticalRate',
                        value: player.attributes.lck
                    }
                ]

                // Need something to know if the attck is base on skill or not
                const damage = (player.attributes.str + Math.floor(player.attributes.str * ( 1/100 ))) - (enemy.attributes.def  + Math.floor(enemy.attributes.def * ( 1/100 )))

                console.log('possible damage :>>>', damage)

                if(player.lv >= enemy.lv){
                    LvDistance = player.lv - enemy.lv
                    Rates[0].value = player.attributes.spd + player.attributes.lck + damage + Math.floor(LvDistance/100)
                }else{
                    LvDistance = enemy.lv - player.lv
                    Rates[0].value = Math.abs(LvDistance -(player.attributes.spd + damage) + Math.floor(LvDistance/100))
                }
                
                const totalRate = Rates.reduce((accu, current) => accu + current.value, 0)

                console.log('Initial rate :>>>', Rates)
                console.log('totalRate :>>>', totalRate)

                for(let i=0; i < Rates.length; i++){
                    Rates[i].value = Rates[i].value / totalRate
                }

                // Sort in ascending order for accuracy
                Rates.sort((a, b) => a.value - b.value)

                console.log('Final rate :>>>', Rates)

                const random = Math.random()

                for(let i=0; i < Rates.length; i++){
                    console.log('random :>>>', random)
                    if(random <= Rates[i].value){
                        switch(Rates[i].name){
                            case 'hitRate':
                                console.log('hit!')
                                messageConfig.message = String(damage)
                                enemy.attributes.hp -= damage
                                console.log('enmey hp:>>>', enemy.attributes.hp)

                                if(enemy.attributes.hp <= 0){
                                    gainExp()
                                }
                            break;
                            case 'evadeRate':
                                console.log('miss!')
                                messageConfig.message = 'MISS!'
                            break;
                            case 'criticalRate':
                                console.log('crit!')
                                const criticalHit = damage * 1.5
                                messageConfig.message = String(criticalHit)
                                enemy.attributes.hp -= criticalHit
                                console.log('enmey hp:>>>', enemy.attributes.hp)

                                if(enemy.attributes.hp <= 0){
                                    gainExp()
                                }
                            break;
                        }
                        // Stop for loop
                        break;
                    // If loop to the late one and still miss anything
                    }else if(i === (Rates.length - 1)){
                        console.log('nothing!')
                        messageConfig.message = 'MISS!'
                    }
                }

                characterCaption.classList.add('invisible') 
                actionMenu.classList.remove('action_menu_open') 
                playerAttackRange.splice(0)

                const { message, style, size} = messageConfig

                displayMessage(message, size, style,  enemy.x, (enemy.y - tileSize))
            }
        }else{
            // Cancel action
            playerWalkableSpace.splice(0)
            playerAttackRange.splice(0)
            if(!characterCaption.classList.contains('invisible')){
                characterCaption.classList.add('invisible') 
            }else{
                characterCaption.classList.remove('invisible') 
            }

            if(actionMenu.classList.contains('action_menu_open')){
                actionMenu.classList.remove('action_menu_open') 
            }else{
                actionMenu.classList.add('action_menu_open') 
            }
        }
    }else
    // if this tile is player
    if((row * tileSize) === player.y && (col * tileSize) === player.x){
        console.log('I am player')

        inspectingCharacter = player

        // Keep tracking player position
        playerPosition.row = row
        playerPosition.col = col

        // If the player is not moving
        if(!player.destination || !messageConfig.message.length){

            // Fill the element with a portion of the character info
            characterName.innerText = player.name
            characterLv.innerText = `LV ${player.lv}`
            characterAp.innerText = `AP: ${player.attributes.ap}`

            // calculation the percentage of the attribute
            for(let i=0; i < gauges.length; i++){
                // console.log(gauges[i].firstElementChild)
                gauges[i].firstElementChild.style.width = getPercentage(characterCaptionAttributes[i], player) + '%';
            }

            // Display the element
            characterCaption.classList.remove('invisible') 
        
            // Open UI element
            actionMenu.classList.add('action_menu_open')    
        }
    }else
    // if this tile is enemy
    if((row * tileSize) === enemy.y && (col * tileSize) === enemy.x){
        inspectingCharacter = enemy
        // Fill the element with a portion of the character info
        characterName.innerText = enemy.name
        characterLv.innerText = `LV ${enemy.lv}`
        characterAp.innerText = `AP: ${enemy.attributes.ap}`

        // calculation the percentage of the attribute
        for(let i=0; i < gauges.length; i++){
            // console.log(gauges[i].firstElementChild)
            gauges[i].firstElementChild.style.width = getPercentage(characterCaptionAttributes[i], enemy) + '%';
        }

        // Display the element
        characterCaption.classList.remove('invisible') 
    }else{
        if(!characterCaption.classList.contains('invisible')){
            characterCaption.classList.add('invisible') 
        }

        if(actionMenu.classList.contains('action_menu_open')){
            actionMenu.classList.remove('action_menu_open') 
        }
    }
})

// Calculate the percentage of an attribute
const getPercentage = (type, character) => {
    let each = 0
    let percentage = 0

    if(type === 'hp'){
        each =  character.attributes.maxHp / 100
        percentage = Math.round( Math.floor(character.attributes.hp / each) )
    }else{
        each = character.attributes.maxMp / 100
        percentage = Math.round( Math.floor(character.attributes.mp / each) )
    }

    return percentage
}

/**
 * Randomly decide x and y
 */
const randomSteps = async() => {
    const getXY = async() => {
        const row =  Math.floor( Math.random() * (playerWalkableSpace.length - 1))
        console.log("row :>>>", row)
        const col = Math.floor( Math.random() * (playerWalkableSpace[row].length - 1))
        console.log("col :>>>", col)
        // if(row >= 0 && playerWalkableSpace[row].length){
        //     return row
        // }else{
        //     await getRow()
        // }
        return { row, col }
    }


    const { row, col } = await getXY()

    if(playerWalkableSpace[row][col][0] === enemyPosition.row && playerWalkableSpace[row][col][1] === enemyPosition.col){
        // Spend an action point
        characterAnimationPhaseEnded(3)                       
    }else{
        // Go to the random selected position
        await prepareDirections(tileMap, enemyPosition, { row: playerWalkableSpace[row][col][0], col: playerWalkableSpace[row][col][1] }, playerReachableDirections)
        console.log("reachableDirections :>>>", playerReachableDirections)
        
        if(playerReachableDirections.length){
            // Start moving
            enemy.setWalkableSpace(playerWalkableSpace)
            beginAnimationPhase(stepCount, 3)  
        }else{
            // Spend an action point
            characterAnimationPhaseEnded(3)  
        }
    } 
}

// An AI for enemy movement decision
const enemyAI = async() => {
    // Get enemy position
    enemyPosition.row = parseInt( enemy.y / tileSize)
    enemyPosition.col = parseInt( enemy.x / tileSize)

    // get walkable space
    actionMode = 'move'
    playerWalkableSpace = await getAvailableSpace(tileMap, enemyPosition, enemy.attributes.moveSpeed, playerPosition)

    if(playerWalkableSpace.length) actionMode = 'search'

    const enemySight = await getAvailableSpace(tileMap, enemyPosition, enemy.attributes.sight)

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
                    if(enemySight[i][block].length){
                        if(enemySight[i][block][0] === playerPosition.row && enemySight[i][block][1] === playerPosition.col){
                            playerDetect = true
                        }                            
                    }
                }                
            }

        }
        
        if(playerDetect){
            console.log('enemyAI found player')            

            // Decide which block to take as destination
            const allDistance = []

            playerWalkableSpace.forEach(layer => {
                layer.forEach(block => {
                     allDistance.push({ cost: getDistance(block[1], block[0], playerPosition), x: block[1], y: block[0] }) 
                })
            }) 

            console.log('all distance :>>>', allDistance)

            const shortest = allDistance.findIndex(d => d.cost === Math.min(...allDistance.map(r => r.cost)))


            if(shortest >= 0){
                await prepareDirections(tileMap, enemyPosition, { row: allDistance[shortest].y, col: allDistance[shortest].x }, playerReachableDirections)

                console.log("reachableDirections :>>>", playerReachableDirections)

                if(playerReachableDirections.length){
                    // Start moving
                    enemy.setWalkableSpace(playerWalkableSpace)
                    beginAnimationPhase(stepCount, 3)  
                }else{
                    // Spend an action point
                    characterAnimationPhaseEnded(3)  
                }                   
            }else{
                console.log('Player out of reach')

                await randomSteps()
            }
        }else{
            console.log('enemyAI can not find the player')

            await randomSteps()
        }
    } 

    // Init the function
    await findXandY()
   
}

// Start moving
const beginAnimationPhase = (step, type) => {
    console.log('step :>>>', step)
    
    if(turnType === 0){
        player.setDestination({row: playerReachableDirections[step][0], col: playerReachableDirections[step][1]})
    }else{
        enemy.setDestination({row: playerReachableDirections[step][0], col: playerReachableDirections[step][1]})
    }
                    
    // Waiting for the animation to end 
    let animationWatcher = setInterval(async() => {
        if(!animationInit) {
            if(turnType === 0){
                playerPosition.row = player.y / tileSize
                playerPosition.col = player.x / tileSize                
            }else{
                enemyPosition.row = enemy.y / tileSize
                enemyPosition.col = enemy.x / tileSize  
            }
            clearInterval(animationWatcher)
            await characterAnimationPhaseEnded(type)
        }else{
            console.log('watching animation')
        }
    }, 100) 
}

// Thing to do after animation ended
const characterAnimationPhaseEnded = async(type) => {

    // If the steps are not finished yet
    if(stepCount < (playerReachableDirections.length - 1)){
        stepCount += 1
        beginAnimationPhase(stepCount, type)
    }else{
        // Reset steps
        stepCount = 0

        // Clear the array
        playerWalkableSpace.splice(0)

        playerReachableDirections.splice(0)

        // If it is the player's turn
        if(type === 2){
            // Spend an action point
            player.attributes.ap -= 1

            characterAp.innerText = `AP: ${player.attributes.ap}`

            // If the player is ran out of action point, move to the enemy phase
            if(player.attributes.ap === 0) {
                pointedBlock = {}
                grid.setPointedBlock(pointedBlock)
                nextTurn()
            }else{
                // Display Action options
                actionMenu.classList.add('action_menu_open')
                characterCaption.classList.remove('invisible')
            }
        }else{
            enemy.attributes.ap -= 1 

            // characterAp.innerText = `AP: ${player.attributes.ap}`
                
            // Move to the next phase
            if(enemy.attributes.ap === 0){
                enemy.wait = true
                nextTurn()
            }else{
                // keep looking
                await enemyAI()
                console.log('enemyAI keep looking')
            }         
        }        
    }

}

//  Initialize the game
const gameLoop = () => {
    tileMap.draw(canvas, ctx, playerWalkableSpace, playerAttackRange)

    if(player !== undefined) {
        player.draw(ctx)
    }else{
        console.log('player undefined')
    }

    if(enemy !== undefined){
        enemy.draw(ctx)
    }else{
        console.log('enemy not found')
    }

    if(grid !== undefined){
        grid.draw(ctx)
    }else{
        console.log('grid close')
    }
}

// Move to the next phase
const nextTurn = () => {
    phaseElement.innerText = (turnType === 0)? 'Enemy Phase' : 'Player Phase'
    // Phase transition fade in
    phaseWrapper.classList.add('fade_in')
    // Phase transition fade out
    setTimeout(() => {
        phaseWrapper.classList.add('fade_out')
    }, 1000)

    //
    setTimeout(() => {
        phaseWrapper.classList.remove('fade_in')
        phaseWrapper.classList.remove('fade_out')
        if(turnType === 0){
            console.log('enemy phase')
            enemy.wait = false
            turnType = 1
            enemy.attributes.ap = enemy.attributes.maxAp
            enemyAI() 
        }else{
            console.log('player phase')
            player.wait = false
            turnType = 0
            player.attributes.ap = player.attributes.maxAp
            turn += 1 
            turnCounter.innerText = `Turn ${turn}`
        }            
    }, 1500)
}
// #endregion


// resize()
window.addEventListener('resize', resize, false);
// window.addEventListener('orientationchange', resize, false);

// 30 fps
setInterval(gameLoop, 1000 / 30)