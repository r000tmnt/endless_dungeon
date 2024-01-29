import TileMap from './TileMap.js';
import Grid from './grid.js';
import Action from './action.js';
import Range from './range.js';
import Option from './option.js';

import { constructInventoryWindow } from './utils/inventory.js'
import { 
    canvas, 
    resize, 
    getPosition, 
    resetActionMenu, 
    alterActionMenu, 
    toggleOptionMenu,
    hideOptionMenu,
    toggleActionMenuAndCharacterCaption,
    toggleActionMenuOption,
    togglePhaseTranistion,
    prepareCharacterCaption,
    displayUIElement,
    hideUIElement,
    cancelAction,
    countTurn
} from './utils/ui.js'
import setting from './utils/setting.js';

let ctx = canvas.getContext("2d");

// #region Tile map setup
let tileSize = setting.general.tileSize = Math.floor(canvas.width / 9);

export const tileMap = new TileMap(tileSize);

export const grid = new Grid(tileMap.map, tileSize, {});

export const range = new Range(tileMap.map, tileSize)

export const action = new Action('', [], [], 0, false);

export const option = new Option('')
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
export const player = []
export const playerPosition = []

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
export const enemy = []
export const enemyPosition = []
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
export var inspectingCharacter = null
// #endregion

// get mouse position and divide by tile size to see where the row and the column it clicked
canvas.addEventListener('mousedown', async(event) =>{
    const { tileSize } = setting.general

    const { row, col } = getPosition(event, tileSize)

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
                    cancelAction()
                }else{
                    hideUIElement()
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
                    }else{
                        cancelAction()
                    }
                }else{
                    hideUIElement()
                }
            }
            break;
            default:
                // if this tile is player
                if(inspectingCharacter?.characterType === 2){
                    console.log('I am player')

                    //Reset action menu option style
                    resetActionMenu()

                    checkAp(inspectingCharacter)

                    prepareCharacterCaption(inspectingCharacter, tileSize)

                    displayUIElement()
                    hideOptionMenu()
                }else
                // if this tile is enemy
                if(inspectingCharacter?.characterType === 3){
                    // Fill the element with a portion of the character info
                    console.log('I am the enemy')

                    // Hide parts of action menu
                    alterActionMenu()

                    prepareCharacterCaption(inspectingCharacter)

                    // Open UI element
                    displayUIElement()
                    hideOptionMenu()
                }else{
                    toggleOptionMenu(tileSize)
                    toggleActionMenuAndCharacterCaption()
                }  
            break;
        }
    }
})

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

const checkAp = (inspectingCharacter) => {
    // If player's ap is not enough to use skill
    if(inspectingCharacter.attributes.ap < 2){
        toggleActionMenuOption('skill', true)
    }else{
        toggleActionMenuOption('skill', false)
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
    togglePhaseTranistion(turnType)

    setTimeout(() => {
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
                countTurn(turn)               
            }else{
                turnType = 0
                nextTurn()
                // TODO: Display result screen
            }
        }            
    }, 1500)
}
// #endregion

resize()
window.addEventListener('resize', resize, false);
// window.addEventListener('orientationchange', resize, false);

// 30 fps
// setInterval(gameLoop, 1000 / 30)

// Game running based on browser refresh rate
window.requestAnimationFrame(gameLoop)

export const checkDroppedItem = async(dropItems) => {
    const playerHasKey = false
    const dropKey = dropItems.findIndex(i => i.id.includes('key')) >= 0

    for(let i=0; i < player.length; i++){
        if(player[i].bag.findIndex(i => i.id.includes('key')) >= 0){
            playerHasKey = true
            return
        }
    }

    // If player doesn't get any key and the enemy didn't drop any key
    if(!playerHasKey && !dropKey){
        // Add a key to the arrat
        dropItems.push(
            {
                amount: 1,
                id: "key_dark_1",
                rate: 0.45454545454545453,
                type: 6
            }
        )
    }

    return dropItems
}
    
// Check if the tile has an event
export const checkIfStepOnTheEvent = async(x, y) => {
    const event = tileMap.event.find(e => e.position.x === x && e.position.y === y && e.trigger === 'stepOn')

    if(event !== undefined) toggleActionMenuOption('pick', false, 'event')
}

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
        playerPosition[index].row = parseInt(currentActingPlayer.y / tileSize)
        playerPosition[index].col = parseInt(currentActingPlayer.x / tileSize)  

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
            displayUIElement()
        }

        action.mode = ''
        console.log('reset action mode :>>>', action.mode)
    }else{
        const index = enemy.findIndex(e => e.animation === currentActingPlayer.animation)
        enemyPosition[index].row = parseInt(currentActingPlayer.y / tileSize)
        enemyPosition[index].col = parseInt(currentActingPlayer.x / tileSize) 
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
