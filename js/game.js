import Character from './Character.js';
import TileMap from './TileMap.js';

// #region Canvas element
const canvas = document.getElementById('game');
const ctx = canvas.getContext("2d");

let canvasPosition
let deviceWidth = window.innerWidth
let deviceHeight = window.innerHeight

const resize = () => {
    console.log('resize')
    // aspect ratio
    const aspectRatio = 9 / 16

    const deviceWidthToDeviceHeight = deviceWidth / deviceHeight

    deviceWidth = window.innerWidth
    deviceHeight = window.innerHeight

    canvas.style.width = window.innerWidth
    canvas.style.height = window.innerHeight

    // Adjust canvas size
    if(deviceWidthToDeviceHeight > aspectRatio){
        // If window width is wider than the aspect ratio
        deviceWidth = Math.floor(deviceHeight * aspectRatio)
        canvas.style.width = deviceWidth + 'px'
        canvas.style.height = deviceHeight + 'px'
    }else{
        // If window height is taller than aspect ratio
        deviceHeight = Math.floor(deviceWidth / aspectRatio)
        canvas.style.width = deviceWidth + 'px'
        canvas.style.height = deviceHeight + 'px'
    }

    // Get canvas position after resize
    canvasPosition = canvas.getBoundingClientRect();
}

// #endregion

// #region Tile map setup
resize()
const tileSize = Math.floor(deviceWidth / 9);

const tileMap = new TileMap(tileSize)
console.log(tileMap)
// #endregion

// #region Game logic variables
var turn = 1

// 0 - player
// 1 - enemy
var turnType = 0

// row === y
// col === x
var playerPosition = {
    row: 0,
    col: 0
}

// row === y
// col === x
var enemyPosition = {
    row: 0,
    col: 0
}

/** An array to store a range of walkable position
 * [ { row, col }, { row, col }, { row, col }...]
 */
var playerWalkableSpace = []

// If the character is moving
var animationInit = false

// A exported function for other object to talk to the game engine
export const animationSignal = (signal) => {
    animationInit = signal
}

// #endregion

// #region Game characters
// Character movement speed
const velocity = 1;

// Create player object
const player = tileMap.getPlayer(velocity)
console.log('player :>>>', player)
// player.setSkills('slash')

// Create enemy object
const enemy = tileMap.getEnemy(velocity)
console.log('enemy :>>>', enemy)
// enemy.setSkills('poison')
// #endregion

// #region Game logic functions
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
canvas.addEventListener('mousedown', function(event){
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
            characterCaption['style']['visibility'] = 'visible' 

            // Open UI element
            actionMenu['style']['margin-left'] = 0          
        }
    }else

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
        characterCaption['style']['visibility'] = 'visible' 
    }else{
        // Hide the element
        characterCaption['style']['visibility'] = 'hidden' 
    }

    // If there are walkable blocks in the array
    if(playerWalkableSpace.length){

        let isWalkable = false

        // Loop through the array find if the position matches
        for(let i=0; i < playerWalkableSpace.length; i++){

            // If true, break the loop 
            if(isWalkable == true) break;

            for(let j = 0; j < playerWalkableSpace[i].length; j++){
                if(playerWalkableSpace[i][j][0] === row && playerWalkableSpace[i][j][1] === col){
                    isWalkable = true
                }
            }
        }

        // If true, swap the tileMap type number
        if(isWalkable == true){
            // Keep tracking player position
            playerPosition.row = row
            playerPosition.col = col

            player.setDestination({row, col})
            player.setWalkableSpace(playerWalkableSpace)

            // Hide the element
            characterCaption['style']['visibility'] = 'hidden'
            
            let animationSignalReceiver = setInterval(async() => {
                if(animationInit) {
                    clearInterval(animationSignalReceiver)
                    watchAnimation(2)
                }
            }, 100)
            
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

// Define what tile is walkable
const getWalkableSpace = async (characterPosition) => {
    const character = (turnType === 0)? player: enemy

    // The max length of blocks in a straight line include the character
    const diameter = (character.attributes.moveSpeed * 2)+ 1
    // 1
    // 3
    // 5
    // 7
    // 5
    // 3
    // 1

    
    // get upper half circle
    for(let i = 1; i <= (diameter - 2); i += 2){
        playerWalkableSpace.push([])  
        // add space for blocks
        for(let block = 1; block <= i; block++){
            playerWalkableSpace[ playerWalkableSpace.length - 1 ].push([])            
        }
    }   

    //get other half circle
    for(let i = diameter; i >= 1; i += -2){
        playerWalkableSpace.push([])  
        for(let block = 1; block <= i; block++){
            playerWalkableSpace[ playerWalkableSpace.length - 1 ].push([])            
        }
    }

    // get x and y position for each tile
    for(let i = 0; i < playerWalkableSpace.length; i++){

        for(let block = 1; block <= playerWalkableSpace[i].length; block++){

            const rowPosition = (( character.attributes.moveSpeed - i ) >= 0? character.attributes.moveSpeed - i : i - character.attributes.moveSpeed) 
            let colPosition =  (playerWalkableSpace[i].length - 1) / 2

            // console.log(colPosition)

            if(i == 0){
                // top
                // If the row is at the top or deeper and the type of the block is a walkable one
                if(characterPosition.row - rowPosition >= 0 && tileMap.map[characterPosition.row - rowPosition][characterPosition.col] !== 1){
                    // keep the row(y) and col(y) position of the block
                    playerWalkableSpace[i][block - 1] = [characterPosition.row - rowPosition, characterPosition.col]  
                }    
            }else if( i === (playerWalkableSpace.length - 1)){
                // bottom
                // If the row is at the bottom or higher an the type of the block is a walkable one
                if(characterPosition.row + rowPosition <= 15 && tileMap.map[characterPosition.row + rowPosition][characterPosition.col] !== 1){
                    // keep the row(y) and col(y) position of the block
                    playerWalkableSpace[i][block - 1] = [characterPosition.row + rowPosition, characterPosition.col]  
                }    
            }else{
                // all direction in between
                colPosition = ( (colPosition >= block)? 
                    (characterPosition.col - (colPosition - (block - 1)) ) : 
                    (characterPosition.col + (block - (colPosition + 1))))

                    // console.log((characterPosition.col + (block - colPosition)))
                // console.log('layer:>>>', i)
                // console.log('block:>>>', block)
                // console.log('col:>>>',colPosition)
                if(i < 3){
                    // Upper half
                    if(characterPosition.row - rowPosition >= 0 && 
                        colPosition <= 8 &&
                        tileMap.map[characterPosition.row - rowPosition][colPosition] !== 1){
                        playerWalkableSpace[i][block - 1] = [characterPosition.row - rowPosition, colPosition]  
                    }
                }else if( i === 3){
                    // Middle
                    if(characterPosition.row >=0 &&
                        colPosition <= 8 &&
                        tileMap.map[characterPosition.row][colPosition] !== -1){
                            playerWalkableSpace[i][block - 1] = [characterPosition.row - rowPosition, colPosition]  
                        }
                }
                else{
                    // The rest
                    if(tileMap.map[characterPosition.row + rowPosition][colPosition] !== undefined){
                        if(characterPosition.row + rowPosition >= 0 &&
                            colPosition <= 8 &&
                            tileMap.map[characterPosition.row + rowPosition][colPosition] !== 1){
                            playerWalkableSpace[i][block - 1] = [characterPosition.row + rowPosition, colPosition]  
                        }                        
                    }
                    
                }
            }
        } 
    }
    console.log("playerWalkableSpace :>>>", playerWalkableSpace)
}

// An AI for enemy movement decision
const enemyAI = async() => {
    // Get enemy position
    enemyPosition.row = parseInt( enemy.y / tileSize)
    enemyPosition.col = parseInt( enemy.x / tileSize)

    // get walkable space
    await getWalkableSpace(enemyPosition)

    // find where to go
    const findXandY = async() => {
        const toRow = async() => {
            let row = Math.floor(Math.random() * playerWalkableSpace.length)
            if(!playerWalkableSpace[row].length){
                await toRow()
            }else{
                return row
            }
        }
        const row = await toRow()
    
        const toCol = async() => {
            let col = Math.floor(Math.random() * playerWalkableSpace[row].length)
            if(col === undefined || playerWalkableSpace[row][col] === undefined || !playerWalkableSpace[row][col].length){
                await toCol()
            }else{
                return col
            }
        }    
        const col = await toCol()
        
        if(row !== undefined && col !== undefined){

            // console.log('player position :>>>', playerPosition)
            console.log('get walkable row :>>>', row)
            console.log('get walkable col :>>>', col)

            const newRow = playerWalkableSpace[row][col][0]
            const newCol = playerWalkableSpace[row][col][1]

            console.log('get newRow :>>>', newRow)
            console.log('get newCol :>>>', newCol)

            // If it is a walkable block
            let isWalkable = tileMap.map[newRow][newCol] === 0
            let playerDetect = false

            if(isWalkable){
                console.log('enemyAI finding player')
                // Check if the player is in the range
                for(let i = 0; i < playerWalkableSpace.length; i++){

                    // if player is in the range, break the loop
                    if(playerDetect) break

                    for(let block = 0; block <= playerWalkableSpace[i].length; block++){
                        if(i === playerPosition.row && block === playerPosition.col){
                            playerDetect = true
                        }
                    }
                }

                // if player is in the range
                if(playerDetect){
                    console.log('enemyAI found player')
                    
                    const reachableDirections = []

                    // Get reachable direction
                    for(let i = 0; i < playerWalkableSpace.length; i++){
    
                        for(let block = 0; block <= playerWalkableSpace[i].length; block++){

                            const currentRow = playerWalkableSpace[i][block][0]
                            const currentCol = playerWalkableSpace[i][block][1]

                            // Top
                            if(currentRow === (playerPosition.row - 1) && currentCol === playerPosition.col){
                                reachableDirections.push([currentRow, currentCol])
                            }

                            // Right
                            if(i === playerPosition.row && currentCol === (playerPosition.col + 1)){
                                reachableDirections.push([currentRow, currentCol])
                            }

                            // Down
                            if(i === (playerPosition.row + 1) && currentCol === playerPosition.col){
                                reachableDirections.push([currentRow, currentCol])
                            }

                            // Left
                            if(i === playerPosition.row  && currentCol === (playerPosition.col - 1)){
                                reachableDirections.push([currentRow, currentCol])
                            }
                        }
                    }

                    // Chose a block randomly
                    const decideWhereToGo = async() => {
                        const targetBlock = Math.floor(Math.random() * reachableDirections.length)

                        if(reachableDirections[targetBlock] === undefined){
                            await decideWhereToGo()
                        }else{
                            return targetBlock
                        }
                    }

                    const finalDecision = await decideWhereToGo()

                    enemy.setDestination({row: reachableDirections[finalDecision][0], col: reachableDirections[finalDecision][1]})
                    enemy.setWalkableSpace(playerWalkableSpace)

                    let animationSignalReceiver = setInterval(() => {
                        if(animationInit) {
                            console.log('enemyAI go towards to player')
                            clearInterval(animationSignalReceiver)
                            watchAnimation(3)
                        }
                    }, 100)               
                }else{
                    console.log('enemyAI can not find the player')
                    // Go to the random selected position
                    enemy.setDestination({ row: newRow, col: newCol })
                    enemy.setWalkableSpace(playerWalkableSpace)

                    let animationSignalReceiver = setInterval(() => {
                        if(animationInit) {
                            console.log('enemyAI start walking')
                            console.log('enemyAI wondering')
                            clearInterval(animationSignalReceiver)
                            watchAnimation(3)
                        }else{
                            console.log('enemyAI waiting')
                        }
                    }, 100)

                    // Rewrite the position
                    enemyPosition.row = newRow
                    enemyPosition.col = newCol
        
                    // console.log(tileMap.map)
                    // console.log(enemyPosition)                    
                }
            }else{
                // keep looking
                await findXandY()
            }             
     
        }

    } 

    // Init the function
    await findXandY()
   
}

// Waiting for the animation to end 
const watchAnimation = (type) => {
    let animationWatcher = setInterval(async() => {
        if(!animationInit) {
            clearInterval(animationWatcher)
            await characterAnimationPhaseEnded(type)
        }
    })
}

// Thing to do after animation ended
const characterAnimationPhaseEnded = async(type) => {
    // Clear the array
    playerWalkableSpace.splice(0)

    if(type === 2){
        // Spend an action point
        player.attributes.ap -= 1

        // If the player is ran out of action point, move to the enemy phase
        if(player.attributes.ap === 0) nextTurn()
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
    }
}
// #endregion

// #region UI element variables and functions
// Get UI element and bind a click event
const actionMenu = document.getElementById('action_menu');
// Hide UI elements
actionMenu.addEventListener('click', () => {
    actionMenu['style']['margin-left'] = -100 + '%'
})

// const actionMenuHolder = actionMenu.getElementByIdy('action_list')
const actionMenuOptions = actionMenu.getElementsByTagName('li')

const characterCaption = document.getElementById('characterCaption')
const characterCaptionAttributes = ['hp', 'mp']

//set actionMenu wrapper width and height
actionMenu.style.width = Math.floor( 40 * Math.floor(deviceWidth / 100)) + 'px';
// actionMenu.style.height = canvas.style.height + 'px';

// action menu child click event
for(let i=0; i < actionMenuOptions.length; i++){

    actionMenuOptions[i].style['font-size'] = Math.floor( 10 * Math.floor(deviceWidth / 100)) + 'px';

    switch(actionMenuOptions[i].dataset.action){
        case 'move':
            actionMenuOptions[i].addEventListener('click', async function(){
                await getWalkableSpace(playerPosition)
            })
        break;
    }
}
// #endregion


// resize()
window.addEventListener('resize', resize, false);
window.addEventListener('orientationchange', resize, false);

// 30 fps
setInterval(gameLoop, 1000 / 30)