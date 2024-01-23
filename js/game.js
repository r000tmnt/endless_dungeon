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
let player = tileMap.getPlayer(velocity)
var playerPosition = {
    row: parseInt(player.y / tileSize),
    col: parseInt(player.x / tileSize)
}
// Create enemy object
let enemy = tileMap.getEnemy(velocity)

var enemyPosition = {
    row: parseInt(enemy.y / tileSize),
    col: parseInt(enemy.x / tileSize)
}

var inspectingCharacter = null
// #endregion

// #region UI element variables and functions
// Get UI element and bind a click event
const appWrapper = document.getElementById('wrapper')
const turnCounter = document.getElementById('turn')
turnCounter.innerText = 'Turn 1'

const actionMenu = document.getElementById('action_menu');
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
const Inventory = document.getElementById('item')
const pickUpWindow = document.getElementById('pickUp')
const skillWindow = document.getElementById('skill')

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
                await action.setMove(tileMap, playerPosition, player.attributes.moveSpeed, enemyPosition)           
            })
        break;
        case 'attack':
            actionMenuOptions[i].addEventListener('click', async() => {
                hideUIElement() 
                await action.setAttack(tileMap, playerPosition, 1)
            })
        break;   
        case "skill":
            actionMenuOptions[i].addEventListener('click', () => {
                hideUIElement()
                action.setSKillWindow(player, tileMap, playerPosition)
            })
        break;
        case 'item':
            actionMenuOptions[i].addEventListener('click', async() => {
                hideUIElement()
                action.mode = 'item'
                constructInventoryWindow(player, enemyPosition, tileMap)
            })
        break; 
        case 'pick':
            actionMenuOptions[i].addEventListener('click', async() => {
                hideUIElement()
                const event = tileMap.getEventOnTile({x: player.x, y: player.y})
                action.mode = 'pick'
                const { width, height } = setting.general.camera
                constructPickUpWindow(player, width, height, event.item, tileMap)
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
                    player.attributes.ap -= 1
                    action.stay(player, characterAnimationPhaseEnded)
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
    if(player !== null){
        player.setCharacterTileSize(tileSize)
        player.setCharacterPosition(playerPosition.col * tileSize, playerPosition.row * tileSize)

        playerPosition = {
            row: parseInt(player.y / tileSize),
            col: parseInt(player.x / tileSize)
        }    
    }
    console.log('player :>>>', player)

    if(enemy !== null){
        enemy.setCharacterTileSize(tileSize)
        enemy.setCharacterPosition(enemyPosition.col * tileSize, enemyPosition.row * tileSize)  
        
        enemyPosition = {
            row: parseInt(enemy.y / tileSize),
            col: parseInt(enemy.x / tileSize)
        }
    }

    console.log('enemy :>>>', enemy)

    const fontSize = setting.general.fontSize = Math.floor( 8 * Math.floor(cameraWidth / 100))
    const fontSize_md = setting.general.fontSize_md = Math.floor(fontSize * 0.75)
    setting.inventory.itemBlockSize = Math.floor(cameraWidth / 100) * 30
    setting.inventory.itemBlockMargin = Math.floor((setting.inventory.itemBlockSize  / 100) * 10)

    const fontsize_sm = setting.general.fontSize_sm = Math.floor(fontSize * 0.5)

    action.setFontSize(fontSize)

    // calculation the percentage of the attribute
    for(let i=0; i < gauges.length; i++){
        // console.log(gauges[i].firstElementChild)
        gauges[i].firstElementChild.style.height = fontsize_sm + 'px';
    }

    // action menu child font size
    for(let i=0; i < actionMenuOptions.length; i++){
        actionMenuOptions[i].style['font-size'] = fontSize + 'px';
    }

    appWrapper.style.width = cameraWidth  + 'px';
    appWrapper.style.height = cameraHeight + 'px';
    
    characterCaption.style.width = Math.floor(50 * (cameraWidth / 100)) + 'px'
    characterName.style['font-size'] = fontSize + 'px';
    characterLv.style['font-size'] = fontsize_sm + 'px';
    characterAp.style['font-size'] = fontsize_sm + 'px';

    // Set phase transition style
    phaseWrapper.style.width = cameraWidth + 'px'
    phaseWrapper.style.height = cameraHeight + 'px' 
    phaseElement.style['font-size'] = fontSize + 'px';

    statusWindow.style.width = cameraWidth + 'px'
    statusWindow.style.height = cameraHeight + 'px' ;
    statusWindow.style.padding = fontsize_sm + 'px';

    avatar.style.width = Math.floor( 50 * Math.floor(cameraWidth / 100)) + 'px';
    avatar.style.height = Math.floor( 50 * Math.floor(cameraWidth / 100)) + 'px';

    // Set skill window style
    skillWindow.style.width = cameraWidth + 'px'
    skillWindow.style.height = cameraHeight + 'px' 
    skillWindow.style.padding = fontsize_sm + 'px';

    // Set inventory style
    Inventory.style.width = cameraWidth + 'px'
    Inventory.style.height = cameraHeight + 'px' 
    Inventory.style.padding = fontsize_sm + 'px';

    for(let i=0; i < backBtn.length; i++){
        backBtn[i].style.transform = `translateX(-${fontsize_sm}px)`
        backBtn[i].style.top = fontsize_sm + 'px'        
    }

    // Set pick up window style
    pickUpWindow.style.width = cameraWidth + 'px' 
    pickUpWindow.style.height = cameraHeight + 'px' 
    pickUpWindow.style.padding = fontsize_sm + 'px';

    // Get canvas position after resize
    ctx = canvas.getContext("2d");
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
            action.resizeSkillWindow(fontSize, fontSize_md, fontsize_sm, cameraWidth)
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
        // If there are selectable blocks in the array
        if(action.mode === 'move' || action.mode === 'attack' || action.mode === 'skill' || action.mode === 'item'){

            const movable = (action.mode === 'move')? 
                await action.move(tileMap, row, col, playerPosition, player, characterAnimationPhaseEnded) : 
                await action.command(canvas, row, col, player, enemy, enemyPosition, tileSize, tileMap, characterAnimationPhaseEnded)

            if(!movable){

                if(action.mode === 'skill'){
                    // Back to skill window
                    action.setSKillWindow(player, tileMap, playerPosition)
                }else if(action.mode === 'item'){
                    // Back to inventory
                    constructInventoryWindow(player)
                }else{
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
                }
            }else{
                characterCaption.classList.add('invisible') 
            }

        }else
        // if this tile is player
        if((row * tileSize) === player?.y && (col * tileSize) === player?.x){
            console.log('I am player')

            inspectingCharacter = player

            //Reset action menu option style
            for(let i=0; i < actionMenuOptions.length; i++){
                actionMenuOptions[i].style.display = 'block'
            }

            checkAp()

            // Check if the tile has an event
            await checkIfStepOnTheEvent(player.x, player.y)

            // Keep tracking player position
            playerPosition = { row, col }

            prepareCharacterCaption(inspectingCharacter)

            displayUIElement()
        }else
        // if this tile is enemy
        if((row * tileSize) === enemy?.y && (col * tileSize) === enemy?.x){
            // Fill the element with a portion of the character info
            console.log('I am the enemy')
            inspectingCharacter = enemy

            // Hide parts of action menu
            for(let i=0; i < actionMenuOptions.length; i++){
               if (actionMenuOptions[i].dataset.action !== 'status'){
                actionMenuOptions[i].style.display = 'none'
               }
            }

            prepareCharacterCaption(inspectingCharacter)

            // Open UI element
            displayUIElement()
        }else{
            if(!characterCaption.classList.contains('invisible')){
                characterCaption.classList.add('invisible') 
            }

            if(actionMenu.classList.contains('action_menu_open')){
                actionMenu.classList.remove('action_menu_open') 
            }
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
    // Get enemy position
    enemyPosition.row = parseInt( enemy.y / tileSize)
    enemyPosition.col = parseInt( enemy.x / tileSize)

    grid.setPointedBlock({ ...enemyPosition })

    const { moveSpeed, sight } = enemy.attributes

    await action.enemyMakeDecision(canvas, tileMap, enemyPosition, moveSpeed, sight, playerPosition, enemy, player, characterAnimationPhaseEnded )
}

// Check if the tile has an event
const checkIfStepOnTheEvent = async(x, y) => {
    const event = tileMap.event.find(e => e.position.x === x && e.position.y === y && e.trigger === 'stepOn')

    actionMenuOptions[4].style.display = (event === undefined)? 'none' : 'block'
}

const checkAp = () => {
    // If player's ap is not enough to use skill
    if(player.attributes.ap < 2){
        actionMenuOptions[2].classList.add('no-event')
    }else{
        actionMenuOptions[2].classList.remove('no-event')
    }
}

// Thing to do after animation ended
const characterAnimationPhaseEnded = async() => {
    // If it is the player's turn
    if(turnType === 0){

        playerPosition.row = player.y / tileSize
        playerPosition.col = player.x / tileSize  

        // Check if the tile has an event
        await checkIfStepOnTheEvent(player.x, player.y)

        player.animation = ''
        prepareCharacterCaption(player)

        // If the player is ran out of action point, move to the enemy phase
        if(player.attributes.ap === 0) {
            grid.setPointedBlock({})
            player.wait = true
            nextTurn()
        }else{
            grid.setPointedBlock({ ...playerPosition })
            checkAp()
            // Display Action options
            actionMenu.classList.add('action_menu_open')
            characterCaption.classList.remove('invisible')
        }
    }else{
        enemyPosition.row = enemy.y / tileSize
        enemyPosition.col = enemy.x / tileSize  
        // characterAp.innerText = `AP: ${player.attributes.ap}`
            
        // Move to the next phase
        if(enemy.attributes.ap === 0){
            grid.setPointedBlock({})
            enemy.wait = true
            nextTurn()
        }else{
            grid.setPointedBlock({ ...enemyPosition })
            // keep looking
            await enemyAI()
            console.log('enemyAI keep looking')
        }         
    }  

    action.mode = ''
    console.log('reset action mode :>>>', action.mode)
}

//  Initialize the game
const gameLoop = () => {
    console.log('rendering')
    tileMap.draw(canvas, ctx)

    if(action.selectableSpace.length){
        range.draw(ctx, action.selectableSpace, action.mode, action.selectedSkill.type)
    }

    if(player !== null) {
        player.draw(ctx)
    }

    if(enemy !== null){
        enemy.draw(ctx)
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
            if(enemy?.attributes?.hp > 0){
                console.log('enemy phase')
                enemy.wait = false
                turnType = 1
                enemy.attributes.ap = enemy.attributes.maxAp
                enemyAI()                 
            }else{
                turnType = 1
                nextTurn()
                // TODO: Display result screen
            }
        }else{
            if(player?.attributes?.hp > 0){
                console.log('player phase')
                player.wait = false
                turnType = 0
                player.attributes.ap = player.attributes.maxAp
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

// A exported function for other object to talk to the game engine
export const animationSignal = (signal) => {
    action.animationInit = signal
}

export const removeCharacter = (type) => {
    switch(type){
        case 2:
            player = null
        break;
        case 3:
            enemy = null
            enemyPosition = null
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
