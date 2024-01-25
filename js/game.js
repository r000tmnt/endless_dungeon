import TileMap from './TileMap.js';
import Grid from './grid.js';
import Action from './action.js';
import Range from './range.js';

import {
    constructInventoryWindow, 
    constructPickUpWindow,
    resizeInventory, 
    clearInventory, 
    resizePickUp, 
    clearPickUpWindow 
} from './utils/inventory.js'
import { resizeHiddenElement } from './utils/ui.js'
import setting from './utils/setting.js';

// aspect ratio
const aspectRatio = 9 / 16

// #region Canvas element
let canvas = document.getElementById('game');
let ctx = canvas.getContext("2d");

let canvasPosition
let deviceWidth = window.innerWidth
let deviceHeight = window.innerHeight

const phaseWrapper = document.getElementById('Phase_Transition');
const phaseElement = document.getElementById('phase');
// #endregion

// #region Tile map setup
let tileSize = Math.floor(canvas.width / 9);

let tileMap = new TileMap(tileSize);

let grid = new Grid(tileMap.map, tileSize, {});

let range = new Range(tileMap.map, tileSize)

let action = new Action('', [], [], 0, false);
// console.log(tileMap)
// #endregion

// #region Game logic variables
var turn = 1

// 0 - player
// 1 - enemy
var turnType = 0
// #endregion

// #region Game characters
// Character movement speed
let velocity = 1;

// Create player object
let player = []
let playerPosition = []

setting.player.forEach(p => {
    const newPlayer = tileMap.getCharacter(velocity, 2, p.name, p.job)
    player.push(newPlayer)

})

// Sort from fastest to slowest, define acting order
player.sort((a, b) => b.attributes.spd - a.attributes.spd)

player.forEach(p => {
    playerPosition.push(
        {
            row: parseInt(p.y / tileSize),
            col: parseInt(p.x / tileSize)
        }
    )
})

// Create enemy object
let enemy = []
let enemyPosition = []
let enemyActingCount = 0

tileMap.enemy.forEach(e => {
    const newPlayer = tileMap.getCharacter(velocity, 3, e.name, e.job)
    enemy.push(newPlayer)
})

// Sort from fastest to slowest, define acting order
enemy.sort((a,b) => b.attributes.spd - a.attributes.apd)

enemy.forEach(e => {
    enemyPosition.push(
        {
            row: parseInt(e.y / tileSize),
            col: parseInt(e.x / tileSize)
        }
    )
})

// The character you clicked
var inspectingCharacter = null
// The position of the character you clicked
var inspectingPosition = null
// #endregion

// #region UI element variables and functions
// Get UI element and bind a click event
const appWrapper = document.getElementById('wrapper')
const turnCounter = document.getElementById('turn')
turnCounter.innerText = 'Turn 1'

// Actiom menu UI
const actionMenu = document.getElementById('action_menu');
const actionMenuOptions = actionMenu.getElementsByTagName('li')

// Option menu UI
const option_menu = document.getElementById('option_menu')
const options = option_menu.getElementsByTagName('li')

// Character caption UI
const characterCaption = document.getElementById('characterCaption')
const characterName = document.getElementById('name')
const characterLv = document.getElementById('lv')
const characterAp = document.getElementById('ap')
const characterCaptionAttributes = ['hp', 'mp']
const gauges = document.querySelectorAll('.gauge')

// Status UI
const statusWindow = document.getElementById('status')
const avatar = document.getElementById('avatar')

const backBtn = document.getElementsByClassName('back')

// Inventory UI
const Inventory = document.getElementById('item')
const pickUpWindow = document.getElementById('pickUp')

// Skill UI
const skillWindow = document.getElementById('skill')

// Party UI
const partyWindow = document.getElementById('party')

// option menu child click event
for(let i=0; i < options.length; i++){
    switch(options[i].dataset.option){
        case 'party':
            options[i].addEventListener('click', () => {
                const memberList = document.getElementById('member_list')
                const member = document.createElement('li')
                const memberIcon = document.createElement('img')
                const memberInfo = document.createElement('div')
                const memberName = document.createElement('span')
                const memberLv = document.createElement('span')
                member.classList.add('member')
                member.classList.add('flex')
                // member.style

                partyWindow.classList.remove('invisible')
            })
        break;
        case 'config':
        break;
        case 'end':
            options[i].addEventListener('click', () => {
                player.forEach(p => {
                    p.attributes.ap = 0
                    p.wait = true
                })
                grid.setPointedBlock({})
                nextTurn()
                option_menu.classList.remove('action_menu_open')
            })
        break;
    }
}


// Back button click event
for(let i=0; i < backBtn.length; i++){
    switch(backBtn[i].dataset.action){
        case 'skill':
            backBtn[i].addEventListener('click', async() => {
                action.mode = ''
                await checkIfStepOnTheEvent(player.x, player.y)
                skillWindow.classList.add('invisible')
                skillWindow.classList.remove('open_window')
                action.clearSkillWindow()
                prepareCharacterCaption(inspectingCharacter)
                displayUIElement()
            })
        break;
        case 'status':
            backBtn[i].addEventListener('click', async() => {
                action.mode = ''
                await checkIfStepOnTheEvent(player.x, player.y)
                statusWindow.classList.add('invisible')
                statusWindow.classList.remove('open_window')
                action.resetStatusWindow()
                prepareCharacterCaption(inspectingCharacter)
                displayUIElement()
            })
        break;
        case 'item':
            backBtn[i].addEventListener('click', async() => {
                action.mode = ''
                // Check if the tile has an event
                await checkIfStepOnTheEvent(player.x, player.y)
                Inventory.classList.add('invisible')
                Inventory.classList.remove('open_window')
                clearInventory()
                prepareCharacterCaption(inspectingCharacter)
                displayUIElement()
            })
        break;
        case 'pick':
            backBtn[i].addEventListener('click', async() => {
                action.mode = ''
                // Check if the tile has an event
                await checkIfStepOnTheEvent(player.x, player.y)
                pickUpWindow.classList.add('invisible')
                pickUpWindow.classList.remove('open_window')
                clearPickUpWindow()
                prepareCharacterCaption(inspectingCharacter)
                displayUIElement()
            })
        break;
    }
}

// action menu child click event
for(let i=0; i < actionMenuOptions.length; i++){
    switch(actionMenuOptions[i].dataset.action){
        case 'move':
            actionMenuOptions[i].addEventListener('click', async() => {
                hideUIElement() 
                const position = playerPosition.find(p => p.row === parseInt(inspectingCharacter.y / tileSize) && p.col === parseInt(inspectingCharacter.x / tileSize))
                const possibleEncounterEnemyPosition = limitPositonToCheck(inspectingCharacter.attributes.moveSpeed, position, enemyPosition)
                await action.setMove(tileMap, inspectingCharacter, position, inspectingCharacter.attributes.moveSpeed, possibleEncounterEnemyPosition)           
            })
        break;
        case 'attack':
            actionMenuOptions[i].addEventListener('click', async() => {
                hideUIElement() 
                const position = playerPosition.find(p => p.row === parseInt(inspectingCharacter.y / tileSize) && p.col === parseInt(inspectingCharacter.x / tileSize))
                await action.setAttack(tileMap, inspectingCharacter, position, 1)
            })
        break;   
        case "skill":
            actionMenuOptions[i].addEventListener('click', () => {
                hideUIElement()
                const position = playerPosition.find(p => p.row === parseInt(inspectingCharacter.y / tileSize) && p.col === parseInt(inspectingCharacter.x / tileSize))
                action.setSKillWindow(inspectingCharacter, tileMap, position)
            })
        break;
        case 'item':
            actionMenuOptions[i].addEventListener('click', async() => {
                hideUIElement()
                action.mode = 'item'
                constructInventoryWindow(inspectingCharacter, enemyPosition, tileMap)
            })
        break; 
        case 'pick':
            actionMenuOptions[i].addEventListener('click', async() => {
                hideUIElement()
                const event = tileMap.getEventOnTile({x: inspectingCharacter.x, y: inspectingCharacter.y})
                action.mode = 'pick'
                const { width, height } = setting.general.camera
                constructPickUpWindow(inspectingCharacter, width, height, event.item, tileMap)
            })
        break;
        case 'status':
            actionMenuOptions[i].addEventListener('click', () => {
                hideUIElement()
                action.setStatusWindow(inspectingCharacter)
            })
        break;
        case 'stay':
            actionMenuOptions[i].addEventListener('click', async() => {
                hideUIElement()
                setTimeout(() => {
                    inspectingCharacter.attributes.ap -= 1
                    characterAnimationPhaseEnded(inspectingCharacter)
                }, 500)
            })
    }
}
// #endregion

const displayUIElement = () => {
    actionMenu.classList.add('action_menu_open')
    characterCaption.classList.remove('invisible') 
}

const hideUIElement = () => {
    actionMenu.classList.remove('action_menu_open')
    characterCaption.classList.add('invisible') 
}

const prepareCharacterCaption = (inspectingCharacter) => {
    // Fill the element with a portion of the character info
    characterName.innerText = inspectingCharacter.name
    characterLv.innerText = `LV ${inspectingCharacter.lv}`
    characterAp.innerText = `AP: ${inspectingCharacter.attributes.ap}`

    // Display arrow symbol if there are points to spend
    if(inspectingCharacter.pt > 0){
        const hint = document.querySelector('.hint')
        hint.style.fontSize = setting.general.fontSize_sm + 'px'
        hint.style.display = 'block'
    }else{
        // Hide arrow symbol
        const hint = document.querySelector('.hint')
        hint.style.display = 'none'
    }

    // calculation the percentage of the attribute
    for(let i=0; i < gauges.length; i++){
        // console.log(gauges[i].firstElementChild)
        gauges[i].firstElementChild.style.width = getPercentage(characterCaptionAttributes[i], inspectingCharacter) + '%';
    }

    const position = (inspectingCharacter.characterType === 2)? playerPosition : enemyPosition

    // Shift UI position based on the character position
    if(position.row > 7 && position.col < Math.floor(9/2)){
        characterCaption.style.left = ((tileSize * 9) - characterCaption.clientWidth) + 'px'
    }else{
        characterCaption.style.left = 'unset'
    }

    // Shift UI position based on the character position
    if(position.row < 7 && position.col < Math.floor(9/2)){
        actionMenu.style.left = (tileSize * 6) + 'px'
    }else{
        actionMenu.style.left = 'unset'
    }  
}

const resize = () => {
    console.log('resize')

    deviceWidth = window.innerWidth
    deviceHeight = window.innerHeight

    if(deviceHeight <= 768){
        deviceWidth = Math.floor(deviceHeight * aspectRatio)       
    }else

    if(deviceWidth <= 500){
        deviceHeight = Math.floor(deviceWidth * (16/9))
    }else{
        deviceWidth = Math.floor(deviceHeight * aspectRatio)
    }

    // Set up tile size according to the canvas width
    tileSize = Math.floor(deviceWidth / 9);
    tileMap.changeTileSize(tileSize)
    grid.setTileSize(tileSize)
    range.setTileSize(tileSize)

    const cameraWidth = setting.general.camera.width = tileSize * 9 
    const cameraHeight = setting.general.camera.height = tileSize * 16 

    // Get the player position relative to the canvas size
    player.forEach((p, index) => {
        p.setCharacterTileSize(tileSize)
        p.setCharacterPosition(playerPosition[index].col * tileSize, playerPosition[index].row * tileSize) 
    })
 
    console.log('player :>>>', player)

    enemy.forEach((e, index) => {
        e.setCharacterTileSize(tileSize)
        e.setCharacterPosition(enemyPosition[index].col * tileSize, enemyPosition[index].row * tileSize)
    })

    console.log('enemy :>>>', enemy)

    const fontSize = setting.general.fontSize = Math.floor( 8 * Math.floor(cameraWidth / 100))
    const fontSize_md = setting.general.fontSize_md = Math.floor(fontSize * 0.75)
    setting.inventory.itemBlockSize = Math.floor(cameraWidth / 100) * 30
    setting.inventory.itemBlockMargin = Math.floor((setting.inventory.itemBlockSize  / 100) * 10)

    const fontsize_sm = setting.general.fontSize_sm = Math.floor(fontSize * 0.5)

    action.setFontSize(Math.floor(fontSize * 1.25))

    // calculation the percentage of the attribute
    for(let i=0; i < gauges.length; i++){
        // console.log(gauges[i].firstElementChild)
        gauges[i].firstElementChild.style.height = fontsize_sm + 'px';
    }

    // action menu child font size
    for(let i=0; i < actionMenuOptions.length; i++){
        actionMenuOptions[i].style.fontSize = fontSize + 'px';
    }

    // option menu child font size
    for(let i=0; i < options.length; i++){
        options[i].style.fontSize = fontSize + 'px';
    }

    appWrapper.style.width = cameraWidth  + 'px';
    appWrapper.style.height = cameraHeight + 'px';
    
    characterCaption.style.width = Math.floor(50 * (cameraWidth / 100)) + 'px'
    characterName.style.fontSize = fontSize + 'px';
    characterLv.style.fontSize = fontsize_sm + 'px';
    characterAp.style.fontSize = fontsize_sm + 'px';

    // Set phase transition style
    phaseWrapper.style.width = cameraWidth + 'px'
    phaseWrapper.style.height = cameraHeight + 'px' 
    phaseElement.style.fontSize = fontSize + 'px';

    // Set status window style
    resizeHiddenElement(statusWindow.style, cameraWidth, cameraHeight, fontsize_sm)
    avatar.style.width = Math.floor(cameraWidth * 0.3) + 'px';
    avatar.style.height = Math.floor(cameraWidth * 0.3) + 'px';

    // Set skill window style
    resizeHiddenElement(skillWindow.style, cameraWidth, cameraHeight, fontsize_sm)

    // Set inventory style
    resizeHiddenElement(Inventory.style, cameraWidth, cameraHeight, fontsize_sm)

    // Set pick up window style
    resizeHiddenElement(pickUpWindow.style, cameraWidth, cameraHeight, fontsize_sm)

    // Set party window style
    resizeHiddenElement(partyWindow.style, cameraWidth, cameraHeight, fontsize_sm)

    for(let i=0; i < backBtn.length; i++){
        backBtn[i].style.transform = `translateX(-${fontsize_sm}px)`
        backBtn[i].style.top = fontsize_sm + 'px'        
    }

    // Get canvas position after resize
    canvasPosition = canvas.getBoundingClientRect();

    console.log('canvas element :>>>', canvas)
    console.log('canvas position :>>>', canvasPosition)

    if(!characterCaption.classList.contains('invisible')) prepareCharacterCaption(inspectingCharacter)

    switch(action.mode){
        case 'item':
            resizeInventory(cameraWidth, fontSize, fontsize_sm)
        break;
        case 'status':
            action.resizeStatusWindow()
        break;
        case 'pick':
            resizePickUp(fontSize, cameraWidth)
        break;
        case 'skill':
            action.resizeSkillWindow(fontSize, fontSize_md, fontsize_sm, cameraWidth, tileSize)
        break;
    }
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

// get mouse position and divide by tile size to see where the row and the column it clicked
canvas.addEventListener('mousedown', async(event) =>{
    const { row, col } = getPosition(event)

    // Hight light pointed block
    grid.setPointedBlock({ row, col })
    
    // If not playing animation
    if(!action.animationInit){
        
        // Define who is on the tile you clicked
        inspectingCharacter = player.find(p => p.y === (row * tileSize) && p.x === (col * tileSize))

        // If is not a player, checking enmey instead
        if(inspectingCharacter === undefined){
            inspectingCharacter = enemy.find(e => e.y === (row * tileSize) && e.x === (col * tileSize))
        }

        let movable = false

        switch(action.mode){
            case 'move':{
                const currentActingPlayer = player.find(p => p.walkableSpace.length)
               
                const position = playerPosition.find(p => p.row === parseInt(currentActingPlayer.y / tileSize) && p.col === parseInt(currentActingPlayer.x / tileSize))

                movable = action.move(tileMap, row, col, position, currentActingPlayer)      
                
                if(!movable){
                    // Cancel action
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

                    action.mode = ''  
                }else{
                    characterCaption.classList.add('invisible') 
                }
            }
            break;
            case 'attack': case 'skill': case 'item':{
                const currentActingPlayer = player.find(p => p.walkableSpace.length)
               
                const position = playerPosition.find(p => p.row === parseInt(currentActingPlayer.y / tileSize) && p.col === parseInt(currentActingPlayer.x / tileSize))
                
                const possibleEncounterEnemyPosition = limitPositonToCheck(currentActingPlayer.attributes.moveSpeed, position, enemyPosition)
                movable = await action.command(canvas, row, col, currentActingPlayer, inspectingCharacter, possibleEncounterEnemyPosition, tileSize, tileMap)

                if(!movable){
                    if(action.mode === 'skill'){
                        // Back to skill window
                        action.setSKillWindow(currentActingPlayer, tileMap, position)
                    }else if(action.mode === 'item'){
                        // Back to inventory
                        constructInventoryWindow(currentActingPlayer)
                    }
                }else{
                    characterCaption.classList.add('invisible') 
                }
            }
            break;
            default:
                // if this tile is player
                if(inspectingCharacter?.characterType === 2){
                    console.log('I am player')

                    //Reset action menu option style
                    for(let i=0; i < actionMenuOptions.length; i++){
                        actionMenuOptions[i].style.display = 'block'
                    }

                    checkAp(inspectingCharacter)

                    // Check if the tile has an event
                    await checkIfStepOnTheEvent(inspectingCharacter.x, inspectingCharacter.y)

                    prepareCharacterCaption(inspectingCharacter)

                    displayUIElement()
                    option_menu.classList.remove('action_menu_open')
                }else
                // if this tile is enemy
                if(inspectingCharacter?.characterType === 3){
                    // Fill the element with a portion of the character info
                    console.log('I am the enemy')

                    // Hide parts of action menu
                    for(let i=0; i < actionMenuOptions.length; i++){
                        if (actionMenuOptions[i].dataset.action !== 'status'){
                            actionMenuOptions[i].style.display = 'none'
                        }
                    }

                    prepareCharacterCaption(inspectingCharacter)

                    // Open UI element
                    displayUIElement()
                    option_menu.classList.remove('action_menu_open')
                }else{
                    if(option_menu.classList.contains('action_menu_open')){
                        option_menu.classList.remove('action_menu_open')
                    }else{
                        // Shift UI position based on the character position
                        if(playerPosition.row < 7 && playerPosition.col < Math.floor(9/2)){
                            option_menu.style.left = (tileSize * 6) + 'px'
                        }else{
                            option_menu.style.left = 'unset'
                        }  

                        option_menu.classList.add('action_menu_open')
                    }

                    if(!characterCaption.classList.contains('invisible')){
                        characterCaption.classList.add('invisible') 
                    }

                    if(actionMenu.classList.contains('action_menu_open')){
                        actionMenu.classList.remove('action_menu_open') 
                    }
                }  
            break;
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

// Enemy movement decision
const enemyAI = async() => {
    grid.setPointedBlock({ ...enemyPosition[enemyActingCount] })

    const { moveSpeed, sight } = enemy[enemyActingCount].attributes

    const possibleEncounterPlayerPosition = limitPositonToCheck(moveSpeed, enemyPosition[enemyActingCount], playerPosition)

    await action.enemyMakeDecision(
        canvas, 
        tileMap, 
        enemyPosition[enemyActingCount], 
        moveSpeed, 
        sight, 
        possibleEncounterPlayerPosition.length? possibleEncounterPlayerPosition : playerPosition, 
        enemy[enemyActingCount], 
        player
    )
}

// Check if the tile has an event
const checkIfStepOnTheEvent = async(x, y) => {
    const event = tileMap.event.find(e => e.position.x === x && e.position.y === y && e.trigger === 'stepOn')

    actionMenuOptions[4].style.display = (event === undefined)? 'none' : 'block'
}

const checkAp = (inspectingCharacter) => {
    // If player's ap is not enough to use skill
    if(inspectingCharacter.attributes.ap < 2){
        actionMenuOptions[2].classList.add('no-event')
    }else{
        actionMenuOptions[2].classList.remove('no-event')
    }
}

//  Initialize the game
const gameLoop = () => {
    console.log('rendering')
    tileMap.draw(canvas, ctx)

    if(action.selectableSpace.length){
        range.draw(ctx, action.selectableSpace, action.mode, action.selectedSkill.type)
    }

    if(action.mode === 'move' && action.reachableDirections.length && !action.animationInit){
        const currentActingPlayer = (turnType === 0)? player.find(p => p.walkableSpace.length) : enemy.find(e => e.walkableSpace.length)
        action.beginAnimationPhase(currentActingPlayer)
    }

    if(player.length) {
        player.forEach(p => p.draw(ctx))
    }

    if(enemy.length){
        enemy.forEach(e => e.draw(ctx))
    }

    if(setting.general.showGrid){
        grid.draw(ctx)
    }

    // Form a loop for rendering
    window.requestAnimationFrame(gameLoop)
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
            if(enemy.length){
                console.log('enemy phase')
                enemy[0].wait = false
                turnType = 1
                enemy[0].attributes.ap = enemy[0].attributes.maxAp
                enemyAI()                 
            }else{
                turnType = 1
                nextTurn()
                // TODO: Display result screen
            }
        }else{
            if(player.length){
                console.log('player phase')
                player[0].wait = false
                turnType = 0
                player[0].attributes.ap = player[0].attributes.maxAp
                grid.setPointedBlock({ ...playerPosition[0] })
                turn += 1 
                turnCounter.innerText = `Turn ${turn}`                
            }else{
                turnType = 0
                nextTurn()
                // TODO: Display result screen
            }
        }            
    }, 1500)
}
// #endregion


// resize()
window.addEventListener('resize', resize, false);
// window.addEventListener('orientationchange', resize, false);

// 30 fps
// setInterval(gameLoop, 1000 / 30)

// Game running based on browser refresh rate
window.requestAnimationFrame(gameLoop)
    
/**
 * Limit enemy position to check in a range based on player selectable space
 * @param {number} range - A number of tiles a character can reach per direction 
 * @param {object} position - An object contains character current position
 * @param {object} targets - An Array of object contains character / enemy position
 * @returns  An Array of filtered enemyPosition
 */
export const limitPositonToCheck = (range, position, targets) => {
    const top = position.row - range
    const down = position.row + range
    const left = position.col - range
    const right = position.col + range

    const possibleEncounterEnemyPosition = targets.filter(e => {
        return e.row >= top && e.row <= down && e.col >= left && e.col <= right
    })

    return possibleEncounterEnemyPosition
}

// Thing to do after animation ended
export const characterAnimationPhaseEnded = async(currentActingPlayer) => {
    // if(enemy === null){
    //     // Level clear
    //     // Play secene
    // }else{
 
    // }

    // If it is the player's turn
    if(turnType === 0){
        const index = player.findIndex(p => p.animation === currentActingPlayer.animation)
        playerPosition[index].row = currentActingPlayer.y / tileSize
        playerPosition[index].col = currentActingPlayer.x / tileSize  

        // Check if the tile has an event
        await checkIfStepOnTheEvent(currentActingPlayer.x, currentActingPlayer.y)

        currentActingPlayer.animation = ''
        prepareCharacterCaption(currentActingPlayer)

        // If the player is ran out of action point, move to the enemy phase
        if(currentActingPlayer.attributes.ap === 0) {
            grid.setPointedBlock({})
            currentActingPlayer.wait = true
            currentActingPlayer.setWalkableSpace([])
            nextTurn()
        }else{
            grid.setPointedBlock({ ...playerPosition[index] })
            inspectingCharacter = currentActingPlayer
            checkAp(currentActingPlayer)
            // Display Action options
            actionMenu.classList.add('action_menu_open')
            characterCaption.classList.remove('invisible')
        }

        action.mode = ''
        console.log('reset action mode :>>>', action.mode)
    }else{
        const index = enemy.findIndex(e => e.animation === currentActingPlayer.animation)
        enemyPosition[index].row = currentActingPlayer.y / tileSize
        enemyPosition[index].col = currentActingPlayer.x / tileSize  
        // characterAp.innerText = `AP: ${player.attributes.ap}`
            
        // Move to the next phase
        if(currentActingPlayer.attributes.ap === 0){
            action.mode = ''
            console.log('reset action mode :>>>', action.mode)
            grid.setPointedBlock({})
            currentActingPlayer.wait = true
            currentActingPlayer.setWalkableSpace([])
            // Check if the others run out of ap also
            if(enemyActingCount !== (enemy.length - 1)){
                enemyActingCount += 1
                await enemyAI()
                console.log('next enemy start moving')
            }else{
                nextTurn()                
            }            
        }else{
            grid.setPointedBlock({ ...enemyPosition[index] })
            // keep looking
            await enemyAI()
            console.log('enemyAI keep looking')
        }         
    } 
}

// A exported function for other object to talk to the game engine
export const animationSignal = (signal) => {
    action.animationInit = signal
}

export const removeCharacter = (type) => {
    switch(type){
        case 2:{
            const index = player.findIndex(p => inspectingCharacter.x === p.x && inspectingCharacter.y === p.y)
            player.splice(index, 1)
            playerPosition.splice(index, 1)
        }
        break;
        case 3:{
            const index = enemy.findIndex(e => inspectingCharacter.x === e.x && inspectingCharacter.y === e.y)
            enemy.splice(index, 1)
            enemyPosition.splice(index, 1)
        }
        break
    }
}

export const setEvent = (position, item, dialogue) => {
    tileMap.setEventOnTile(position, item, dialogue)
}

export const setTile = (row, col, type) => {
    tileMap.changeTile(row, col, type)
}

export const setRange = (range) => {
    action.setSelectableSpace(range)
}
