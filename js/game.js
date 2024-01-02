// import Character from './Character.js';
import TileMap from './TileMap.js';
import Grid from './grid.js';
import Action from './action.js';

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

// A exported function for other object to talk to the game engine
export const animationSignal = (signal) => {
    action.animationInit = signal
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

// Back button click event
for(let i=0; i < backBtn.length; i++){
    switch(backBtn[i].dataset.action){
        case 'status':
            backBtn[i].addEventListener('click', () => {
                action.mode = ''

                if(inspectingCharacter.characterType === 3){
                    //Reset action menu option style
                    for(let i=0; i < actionMenuOptions.length; i++){
                        actionMenuOptions[i].style.display = 'block'
                    }
                }

                statusWindow.classList.add('invisible')
                statusWindow.classList.remove('open_window')
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

// get mouse position and divide by tile size to see where the row and the column it clicked
canvas.addEventListener('mousedown', async(event) =>{
    const { row, col } = getPosition(event)

    // Hight light pointed block
    grid.setPointedBlock({ row, col })
    
    // If not playing animation
    if(!action.animationInit){
        // If there are selectable blocks in the array
        if(action.mode === 'move' || action.mode === 'attack'){

            const movable = (action.mode === 'move')? await action.move(tileMap, row, col, playerPosition, player, characterAnimationPhaseEnded) : await action.attack(row, col, player, enemy, enemyPosition, tileSize, tileMap, characterAnimationPhaseEnded)

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
        if((row * tileSize) === player.y && (col * tileSize) === player.x){
            console.log('I am player')

            inspectingCharacter = player

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
            characterCaption.classList.remove('invisible') 
        
            // Open UI element
            actionMenu.classList.add('action_menu_open')  
        }else
        // if this tile is enemy
        if((row * tileSize) === enemy.y && (col * tileSize) === enemy.x){
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

// Thing to do after animation ended
const characterAnimationPhaseEnded = async() => {
    // If it is the player's turn
    if(turnType === 0){

        if(action.mode === 'stay' || action.mode === 'attack'){
            player.attributes.ap -= 1
        }

        // if(action.mode === 'skill'){
        // TODO: Count the requrie action point of the skill
        // }

        characterAp.innerText = `AP: ${player.attributes.ap}`

        playerPosition.row = player.y / tileSize
        playerPosition.col = player.x / tileSize  

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
    tileMap.draw(canvas, ctx, action.selectableSpace, action.mode)

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
            if(enemy.attributes.hp > 0){
                console.log('enemy phase')
                enemy.wait = false
                turnType = 1
                enemy.attributes.ap = enemy.attributes.maxAp
                enemyAI()                 
            }else{
                // TODO: Display result screen
            }
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