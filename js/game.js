import Character from './Character.js';
import TileMap from './TileMap.js';

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

let tileMap = new TileMap(tileSize)
// console.log(tileMap)
// #endregion

// #region Game characters
// Character movement speed
let velocity = 1;

// Create player object
let player = tileMap.getPlayer(velocity)
console.log('player :>>>', player)
// player.setSkills('slash')
var playerPosition = {
    row: player.y / tileSize,
    col: player.x / tileSize
}

// Create enemy object
let enemy = tileMap.getEnemy(velocity)
console.log('enemy :>>>', enemy)
// enemy.setSkills('poison')

var enemyPosition = {
    row: enemy.y / tileSize,
    col: enemy.x / tileSize
}
// #endregion

// #region UI element variables and functions
// Get UI element and bind a click event
const turnCounter = document.getElementById('turn')
turnCounter.innerText = 'Turn 1'

const actionMenu = document.getElementById('action_menu');

// const actionMenuHolder = actionMenu.getElementByIdy('action_list')
const actionMenuOptions = actionMenu.getElementsByTagName('li')

const characterCaption = document.getElementById('characterCaption')
const characterCaptionAttributes = ['hp', 'mp']

// action menu child clcik event
for(let i=0; i < actionMenuOptions.length; i++){
    switch(actionMenuOptions[i].dataset.action){
        case 'move':
            actionMenuOptions[i].addEventListener('click', async() => {
                actionMode = 'move'
                playerWalkableSpace = await getAvailableSpace(playerPosition, player.attributes.moveSpeed, enemyPosition)
                console.log("playerWalkableSpace : >>>", playerWalkableSpace)
                // Hide the element
                characterCaption.classList.add('invisible')               
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

    canvas.width = Math.floor(deviceHeight * aspectRatio)
    canvas.height = deviceHeight

    // Adjust canvas size
    // if(deviceWidthToDeviceHeight > aspectRatio){
    //     // If window width is wider than the aspect ratio
    //     deviceWidth = Math.floor(deviceHeight * aspectRatio)
    //     canvas.style.width = deviceWidth + 'px'
    //     canvas.style.height = deviceHeight + 'px'
    // }else{
    //     // If window height is taller than aspect ratio
    //     deviceHeight = Math.floor(deviceWidth / aspectRatio)
    //     canvas.style.width = deviceWidth + 'px'
    //     canvas.style.height = deviceHeight + 'px'
    // }

    phaseWrapper.style.width = canvas.width + 'px';
    phaseWrapper.style.height = canvas.height + 'px';

    // Set up tile size according to the canvas width
    tileSize = Math.floor(canvas.width / 9);
    tileMap = new TileMap(tileSize)

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

    // action menu child font size
    for(let i=0; i < actionMenuOptions.length; i++){
        actionMenuOptions[i].style['font-size'] = Math.floor( 10 * Math.floor(canvas.width / 100)) + 'px';

    }

    // Get canvas position after resize
    ctx = canvas.getContext("2d");
    canvasPosition = canvas.getBoundingClientRect();

    console.log('canvas element :>>>', canvas)
    console.log('canvas position :>>>', canvasPosition)
}

// First time drawing the canvas
resize()


// #region Game logic variables
var turn = 1

// 0 - player
// 1 - enemy
var turnType = 0

var actionMode = ''

/** An array to store a range of walkable position
 * [ { row, col }, { row, col }, { row, col }...]
 */
var playerWalkableSpace = []

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


// #region Game logic functions
const getDistance = (x ,y, target) => {
    // Find the shortest distance
    let distanceX = 0, distanceY = 0

    if(x > target.col){
        distanceX = x - target.col
    }
    
    if(x < target.col){
        distanceX = target.col - x
    }

    if(y > target.row){
        distanceY = y - target.row
    }
    
    if(y < target.row){
        distanceY = target.row - y
    }

    console.log('total distance :>>>', distanceX + distanceY)

    return distanceX + distanceY
}

const getDirections = (x, y, target) => {
    const reachableDirections = []

    // TOP
    if(tileMap.map[y - 1][x] === 0){
        reachableDirections.push({ cost: getDistance(x, y-1, target), x, y: y-1 })
    }

    // DOWN
    if(tileMap.map[y + 1][x] === 0){
        reachableDirections.push({ cost: getDistance(x, y+1, target), x, y: y+1 })
    }  

    // LEFT
    if(tileMap.map[y][x - 1] === 0){
        reachableDirections.push({ cost: getDistance(x-1, y, target), x: x-1, y })
    }

    //RIGHT
    if(tileMap.map[y][x + 1] === 0){
        reachableDirections.push({ cost: getDistance(x+1, y, target), x: x+1, y })
    }

    return reachableDirections
}

/**
 * Form an array of directions
 * @param {object} currentPlayer 
 * @param {object} target 
 * @returns 
 */
const prepareDirections = async(currentPlayer, target) => {
    let x = currentPlayer.col, y = currentPlayer.row 

    let reachableDirections = [] 

    const getEachStep = async() => {
        reachableDirections = getDirections(x, y, target)

        let shortest 

        // Check if the cost of each block are the same
        const sameCost = reachableDirections.every(d => d === reachableDirections[0])

        if(sameCost){
            // Choose the latest one
            shortest = reachableDirections.length - 1
        }else{
            // Choose the shortest one
            shortest = reachableDirections.findIndex(d => d.cost === Math.min(...reachableDirections.map(r => r.cost)));
        }

        playerReachableDirections.push([reachableDirections[shortest].y, reachableDirections[shortest].x])

        // If destination not reached
        if(reachableDirections[shortest].y !== target.row || reachableDirections[shortest].x !== target.col ){
            // Update x and y axis
            x = reachableDirections[shortest].x
            y = reachableDirections[shortest].y
            // Get all steps
            await getEachStep()        
        }      
    }

    // Get all steps
    await getEachStep()

    console.log('return reachableDirections :>>>', reachableDirections)
}


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

    // If is the turn for player
    if(turnType === 0){
        const { row, col } = getPosition(event)
        // console.log('row :>>>', row)
        // console.log('column :>>>', col)
    
        // if this tile is player
        if((row * tileSize) === player.y && (col * tileSize) === player.x){
            console.log('I am player')
    
            // Keep tracking player position
            playerPosition.row = row
            playerPosition.col = col
    
            // If the player is not moving
            if(!player.destination){
    
                // Fill the element with a portion of the character info
                characterCaption.firstElementChild.innerHTML = player.name
                const gauges = characterCaption.getElementsByTagName('li')
    
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
        }else {
        
            // if this tile is enemy
            if((row * tileSize) === enemy.y && (col * tileSize) === enemy.x){
                // Fill the element with a portion of the character info
                characterCaption.firstElementChild.innerHTML = enemy.name
                const gauges = characterCaption.getElementsByTagName('li')
        
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
        
            // If there are walkable blocks in the array
            if(playerWalkableSpace.length){
        
                let inRange = false

                // Loop through the array find if the position matches
                for(let i=0; i < playerWalkableSpace.length; i++){
                    if(inRange){
                        break
                    }else{
                        for(let j=0; j < playerWalkableSpace[i].length; j++){
                            if(playerWalkableSpace[i][j][0] === row && playerWalkableSpace[i][j][1] === col){
                                inRange = true

                                await prepareDirections(playerPosition, { row: row, col: col })

                                // Hide the element
                                characterCaption.classList.remove('visible')
                
                                player.setWalkableSpace(playerWalkableSpace)  
                
                                // Start moving
                                // Maybe I need a global variable to track the steps...
                                beginAnimationPhase(stepCount, 2)   
                            }
                        }
                    }
                }   
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

/**
 * Define what tile is walkable
 * @param {object} characterPosition - The x and y axis of the current acting character 
 * @param {number} blocksPerDirection - Number of block for each direction
 * @param {object} enemyPosition - The x and y axis of the enemy ( player or bot ) 
 * @returns 
 */
const getAvailableSpace = async (characterPosition, blocksPerDirection, enemyPosition = null) => {
    const availableSpace = []

    // The max length of blocks in a straight line include the character
    const diameter = (blocksPerDirection * 2)+ 1
    // 1
    // 3
    // 5
    // 7
    // 5
    // 3
    // 1

    
    // get upper half circle
    for(let i = 1; i <= (diameter - 2); i += 2){

        // If the previous layer is empty, remove the array
        if(availableSpace.length){
            if(!availableSpace[availableSpace.length - 1].length){
                availableSpace.splice(availableSpace.length - 1, 1)
            }
        }

        // Add an array for the layer
        availableSpace.push([])
        
        // Layer counting
        let rowCount = (i - 2) < 0? 0 : (i -1) / 2
        for(let block = 1; block <= i; block++){
            console.log('checking block :>>>', block) 
            const inspectRow = characterPosition.row - (blocksPerDirection - rowCount)
            let inspectCol = characterPosition.col

            if(inspectRow < 0){
                // Skip current iteration
                continue
            }

            // Get the number of cols to count in both directions
            const left_and_right_blocks = (i - 1) / 2

            if(left_and_right_blocks > 0){
                // Decide to add or minus the col number
                if(block > left_and_right_blocks){
                    inspectCol = inspectCol + (block - (left_and_right_blocks + 1))
                }else{
                    inspectCol = inspectCol - (left_and_right_blocks - (block - 1))
                }

                let onTheSameBlock = characterPosition.row === inspectRow && characterPosition.col === inspectCol

                if(enemyPosition !== null){
                    onTheSameBlock = enemyPosition.row === inspectRow && enemyPosition.col === inspectCol
                }

                console.log(`checking tile map row:${inspectRow} col:${inspectCol} :>>>`, tileMap.map[inspectRow][inspectCol])

                // Check if the block is walkable
                if(tileMap.map[inspectRow][inspectCol] === 0 && !onTheSameBlock){
                    availableSpace[availableSpace.length - 1].push([inspectRow, inspectCol])
                }
            }else{
                availableSpace[availableSpace.length - 1].push([inspectRow, inspectCol])
            }
        }
    }   

    //get other half circle
    for(let i = diameter; i >= 1; i += -2){

        // If the previous layer is empty, remove the array
        if(availableSpace.length){
            if(!availableSpace[availableSpace.length - 1].length){
                availableSpace.splice(availableSpace.length - 1, 1)
            }
        }

        // Add an array for the layer
        availableSpace.push([])

        let rowCount = (i < diameter)? (diameter - i) / 2 : 0
        for(let block = 1; block <= i; block++){
            console.log('checking block :>>>', block) 
            const inspectRow = characterPosition.row + rowCount
            let inspectCol = characterPosition.col 

            if(inspectRow > 15){
                // Skip current iteration
                continue
            }
            
            // Get the number of cols to count in both directions
            const left_and_right_blocks = (i - 1) / 2

            if(left_and_right_blocks > 0){
                // Decide to add or minus the col number
                if(block > left_and_right_blocks){
                    inspectCol = inspectCol + (block - (left_and_right_blocks + 1))
                }else{
                    inspectCol = inspectCol - (left_and_right_blocks - (block - 1))
                }

                let onTheSameBlock = characterPosition.row === inspectRow && characterPosition.col === inspectCol

                if(enemyPosition !== null){
                    onTheSameBlock = enemyPosition.row === inspectRow && enemyPosition.col === inspectCol
                }

                // Check if the block is walkable
                if(tileMap.map[inspectRow][inspectCol] === 0 && !onTheSameBlock){
                    availableSpace[availableSpace.length -1].push([inspectRow, inspectCol])
                }
            }else{
                availableSpace[availableSpace.length -1].push([inspectRow, inspectCol])
            }
        }
    }

    console.log("availableSpace :>>>", availableSpace)
    return availableSpace
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
        await prepareDirections(enemyPosition, { row: playerWalkableSpace[row][col][0], col: playerWalkableSpace[row][col][1] })
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
    playerWalkableSpace = await getAvailableSpace(enemyPosition, enemy.attributes.moveSpeed, playerPosition)

    if(playerWalkableSpace.length) actionMode = 'search'

    const enemySight = await getAvailableSpace(enemyPosition, enemy.attributes.sight)

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
                await prepareDirections(enemyPosition, { row: allDistance[shortest].y, col: allDistance[shortest].x })

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

            // If the player is ran out of action point, move to the enemy phase
            if(player.attributes.ap === 0) {
                nextTurn()
            }else{
                // Display Action options
                actionMenu.classList.add('action_menu_open')
                characterCaption.classList.remove('invisible')
            }
        }else{
            enemy.attributes.ap -= 1 
                
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
    tileMap.draw(canvas, ctx, playerWalkableSpace)

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