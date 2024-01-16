// import Character from './Character.js';
import TileMap from './TileMap.js';
import Grid from './grid.js';
import Action from './action.js';

import { resizeInventory, clearInventory, resizePickUp, clearPickUpWindow } from './utils/inventory.js'
import setting from './utils/setting.js';

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
// player.setSkills('slash')
var playerPosition = {
    row: player.y / tileSize,
    col: player.x / tileSize
}
// Create enemy object
let enemy = tileMap.getEnemy(velocity)
// enemy.setSkills('poison')

var enemyPosition = {
    row: enemy.y / tileSize,
    col: enemy.x / tileSize
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
const backBtn = document.getElementsByClassName('back')
const avatar = document.getElementById('avatar')
const Inventory = document.getElementById('item')
const pickUpWindow = document.getElementById('pickUp')

// Back button click event
for(let i=0; i < backBtn.length; i++){
    switch(backBtn[i].dataset.action){
        case 'status':
            backBtn[i].addEventListener('click', () => {
                action.mode = ''

                statusWindow.classList.add('invisible')
                statusWindow.classList.remove('open_window')
            })
        break;
        case 'item':
            backBtn[i].addEventListener('click', async() => {
                action.mode = ''
                // Check if the tile has an event
                await checkIfStepOnTheEvent(player.x, player.y)
                Inventory.classList.add('invisible')
                Inventory.classList.remove('open_window')
                actionMenu.classList.add('action_menu_open')
                clearInventory()
            })
        break;
        case 'pick':
            backBtn[i].addEventListener('click', async() => {
                action.mode = ''
                // Check if the tile has an event
                await checkIfStepOnTheEvent(player.x, player.y)
                pickUpWindow.classList.add('invisible')
                pickUpWindow.classList.remove('open_window')
                actionMenu.classList.add('action_menu_open')
                clearPickUpWindow()
            })
        break;
    }
}

// action menu child click event
for(let i=0; i < actionMenuOptions.length; i++){
    switch(actionMenuOptions[i].dataset.action){
        case 'move':
            actionMenuOptions[i].addEventListener('click', async() => {
                actionMenu.classList.remove('action_menu_open')
                // Hide the element
                characterCaption.classList.add('invisible')  
                await action.setMove(tileMap, playerPosition, player.attributes.moveSpeed, enemyPosition)           
            })
        break;
        case 'attack':
            actionMenuOptions[i].addEventListener('click', async() => {
                actionMenu.classList.remove('action_menu_open')
                await action.setAttack(tileMap, playerPosition, 1)
            })
        break;   
        case 'item':
            actionMenuOptions[i].addEventListener('click', async() => {
                actionMenu.classList.remove('action_menu_open')
                await action.setInventoryWindow(player, canvasPosition)
            })
        break; 
        case 'pick':
            actionMenuOptions[i].addEventListener('click', async() => {
                actionMenu.classList.remove('action_menu_open')
                const event = tileMap.getEventOnTile({x: player.x, y: player.y})
                await action.setPickUpWindow(player, canvasPosition, event.item, tileMap)
            })
        break;
        case 'status':
            actionMenuOptions[i].addEventListener('click', () => {
                action.setStatusWindow(inspectingCharacter)
            })
        break;
        case 'stay':
            actionMenuOptions[i].addEventListener('click', async() => {
                actionMenu.classList.remove('action_menu_open')
                // Hide the element
                characterCaption.classList.add('invisible')
                setTimeout(() => {
                    action.stay(player, characterAnimationPhaseEnded)
                }, 500)
            })
    }
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
    tileMap.changeTileSize(tileSize)
    grid = new Grid(tileMap.map, tileSize, {})

    // Get the player position relative to the canvas size
    if(player !== null){
        player.setCharacterTileSize(tileSize)
        player.setCharacterPosition(playerPosition.col * tileSize, playerPosition.row * tileSize)

        playerPosition = {
            row: player.y / tileSize,
            col: player.x / tileSize
        }        
    }
    console.log('player :>>>', player)

    if(enemy !== null){
        enemy.setCharacterTileSize(tileSize)
        enemy.setCharacterPosition(enemyPosition.col * tileSize, enemyPosition.row * tileSize)  
        
        enemyPosition = {
            row: enemy.y / tileSize,
            col: enemy.x / tileSize
        }
    }

    console.log('enemy :>>>', enemy)

    //set actionMenu wrapper width and height
    actionMenu.style.width = Math.floor( 30 * Math.floor(canvas.width / 100)) + 'px';

    const fontSize = setting.general.fontSize = Math.floor( 8 * Math.floor(canvas.width / 100))
    setting.inventory.itemBlockSize = Math.floor(canvas.width / 100) * 30
    setting.inventory.itemBlockMargin = Math.floor((setting.inventory.itemBlockSize  / 100) * 10)

    action.setFontSize(fontSize)

    // calculation the percentage of the attribute
    for(let i=0; i < gauges.length; i++){
        // console.log(gauges[i].firstElementChild)
        gauges[i].firstElementChild.style.height = (fontSize / 2) + 'px';
    }

    // action menu child font size
    for(let i=0; i < actionMenuOptions.length; i++){
        actionMenuOptions[i].style['font-size'] = fontSize + 'px';
    }

    appWrapper.style.width = (tileSize * 9)  + 'px';
    appWrapper.style.height = (tileSize * 16) + 'px';
    
    characterCaption.style.width = Math.floor( 50 * Math.floor(canvas.width / 100)) + 'px'
    characterName.style['font-size'] = fontSize + 'px';
    characterLv.style['font-size'] = (fontSize / 2) + 'px';
    characterAp.style['font-size'] = (fontSize / 2) + 'px';

    // Set phase transition style
    phaseWrapper.style.width = (tileSize * 9) + 'px'
    phaseWrapper.style.height = (tileSize * 16) + 'px' 
    phaseElement.style['font-size'] = fontSize + 'px';

    // Set status window style
    statusWindow.style.width = (tileSize * 9) + 'px'
    statusWindow.style.height = (tileSize * 16) + 'px' ;
    statusWindow.style.padding = (fontSize / 2) + 'px';

    avatar.style.width = Math.floor( 50 * Math.floor(canvas.width / 100)) + 'px';
    avatar.style.height = Math.floor( 50 * Math.floor(canvas.width / 100)) + 'px';

    // Set inventory style
    Inventory.style.width = (tileSize * 9) + 'px'
    Inventory.style.height = (tileSize * 16) + 'px' 
    Inventory.style.padding = (fontSize / 2) + 'px';

    for(let i=0; i < backBtn.length; i++){
        backBtn[i].style.transform = `translateX(-${fontSize / 2}px)`
        backBtn[i].style.top = (fontSize / 2) + 'px'        
    }

    // Set pick up window style
    pickUpWindow.style.width = (tileSize * 9) + 'px' 
    pickUpWindow.style.height = (tileSize * 16) + 'px' 
    pickUpWindow.style.padding = (fontSize / 2) + 'px';

    // Get canvas position after resize
    ctx = canvas.getContext("2d");
    canvasPosition = canvas.getBoundingClientRect();

    console.log('canvas element :>>>', canvas)
    console.log('canvas position :>>>', canvasPosition)

    switch(action.mode){
        case 'item':
            resizeInventory(canvasPosition)
        break;
        case 'status':
            action.resizeStatusWindow()
        break;
        case 'pick':
            resizePickUp(canvasPosition)
        break;
        case 'skill':
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
        if(action.mode === 'move' || action.mode === 'attack'){

            const movable = (action.mode === 'move')? await action.move(tileMap, row, col, playerPosition, player, characterAnimationPhaseEnded) : await action.attack(canvas, row, col, player, enemy, enemyPosition, tileSize, tileMap, characterAnimationPhaseEnded)

            if(!movable){
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

            // Check if the tile has an event
            await checkIfStepOnTheEvent(player.x, player.y)

            // Keep tracking player position
            playerPosition.row = row
            playerPosition.col = col

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
            // Shift UI position based on the character position
            if(playerPosition.row > 8 && playerPosition.row < 16){
                if(playerPosition.col > 0 && playerPosition.col < Math.floor(9/2)){
                    characterCaption.style.left = ((tileSize * 9) - characterCaption.clientWidth) + 'px'
                }else{
                    characterCaption.style.left = 'unset'
                }
            }
            characterCaption.classList.remove('invisible') 
        
            // Open UI element
            // Shift UI position based on the character position
            if(playerPosition.row > 0 && playerPosition.row < 8){
                if(playerPosition.col > 0 && playerPosition.col < Math.floor(9/2)){
                    actionMenu.style.left = (tileSize * 6) + 'px'
                }else{
                    actionMenu.style.left = 'unset'
                }
            }
            actionMenu.classList.add('action_menu_open')  
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

            // Open UI element
            actionMenu.classList.add('action_menu_open')  

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

    await action.enemyMove(tileMap, enemyPosition, moveSpeed, sight, playerPosition, enemy, characterAnimationPhaseEnded )
}

// Check if the tile has an event
const checkIfStepOnTheEvent = async(x, y) => {
    const event = tileMap.event.find(e => e.position.x === x && e.position.y === y && e.trigger === 'stepOn')

    actionMenuOptions[4].style.display = (event === undefined)? 'none' : 'block'
}

// Thing to do after animation ended
const characterAnimationPhaseEnded = async() => {
    // If it is the player's turn
    if(turnType === 0){

        player.attributes.ap -= 1

        // if(action.mode === 'skill'){
        // TODO: Count the requrie action point of the skill
        // }

        characterAp.innerText = `AP: ${player.attributes.ap}`

        playerPosition.row = player.y / tileSize
        playerPosition.col = player.x / tileSize  

        // Check if the tile has an event
        await checkIfStepOnTheEvent(player.x, player.y)

        // If the player is ran out of action point, move to the enemy phase
        if(player.attributes.ap === 0) {
            grid.setPointedBlock({})
            player.wait = true
            nextTurn()
        }else{
            grid.setPointedBlock({ ...playerPosition })
            // Display Action options
            actionMenu.classList.add('action_menu_open')
            characterCaption.classList.remove('invisible')
        }
    }else{
        // if(action.mode === 'skill'){
        // TODO: Count the requrie action point of the skill
        // }
        enemy.attributes.ap -= 1 

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
    tileMap.draw(canvas, ctx, action.selectableSpace, action.mode)

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
        break
    }
}

export const setEvent = (position, item, dialogue) => {
    tileMap.setEventOnTile(position, item, dialogue)
}

export const setTile = (row, col, type) => {
    tileMap.changeTile(row, col, type)
}
