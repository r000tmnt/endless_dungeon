import Character from './Character.js';
import TileMap from './TileMap.js';

// #region Canvas element
const canvas = document.getElementById('game');
const ctx = canvas.getContext("2d");
const canvasPosition = canvas.getBoundingClientRect();
// #endregion

// #region Tile map setup
const tileSize = 32;

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


var defaultWalkableRange = 3

/** An array to store a range of walkable position
 * [ { row, col }, { row, col }, { row, col }...]
 */
var playerWalkableSpace = []

// #endregion

// #region Game characters
// player
const player = new Character('Player', 15, 10, 10, 7, 5, 5, 3)
player.setSkills('slash')

// enemy
const enemy = new Character('zombie', 10, 3, 7, 5, 2, 2, 1, 1, 1)
enemy.setSkills('poison')
// #endregion

// #region Game logic functions
// Get the position on the tileMap
const getPosition = (event) => {
    // console.log(event)
    const positionY = event.clientY - canvasPosition.top
    const positionX = event.clientX - canvasPosition.left

    const row = parseInt( positionY / tileSize)
    const col = parseInt( positionX / tileSize)

    return { row, col }
}

// get mouse position and divide by tile size to see where the row and the column it clicked
canvas.addEventListener('mousedown', function(event){
    const { row, col } = getPosition(event)
    console.log('row :>>>', row)
    console.log('column :>>>', col)

    // if this tile is player
    if(tileMap.map[row][col] === 2){
        console.log('I am player')

        // Keep tracking where the player is on the tile map
        playerPosition.row = row
        playerPosition.col = col

        // If the player is out of action point
        if(player.ap === 0){
            // Do something else...
        }else{
            // Open UI element
            actionMenu['style']['margin-left'] = 0
        }
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
            tileMap.map[playerPosition.row][playerPosition.col] = 0
            tileMap.map[row][col] = 2
            playerPosition.row = row
            playerPosition.col = col
        }
        
        // Clear the array
        playerWalkableSpace.splice(0)
        // Spend an action point
        player.ap = player.ap - 1

        // If the player is ran out of action point, move to the enemy phase
        if(player.ap === 0) nextTurn()
    }

    if(tileMap.map[row][col] === 3){
        console.log('I am an enemy')
    }
})


// get mouse position and divide by tile size to see where the row and the column it moved
canvas.addEventListener('mousemove', function(event){
    const { row, col } = getPosition(event)

    // console.log('row :>>>', row)
    // console.log('column :>>>', col)

    // if this tile is player
    if(tileMap.map[row][col] === 2){

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

    }else 
    
    // Same things go for the enemy
    if(tileMap.map[row][col] === 3){
        // console.log('I am enemy')

        characterCaption.firstElementChild.innerHTML = enemy.name
        const gauges = characterCaption.getElementsByTagName('li')

        for(let i=0; i < gauges.length; i++){
            // console.log(gauges[i].children)
            gauges[i].firstElementChild.style.width = getPercentage(characterCaptionAttributes[i], enemy) + '%';
        }

        characterCaption['style']['visibility'] = 'visible'        
    }
    else{
        characterCaption['style']['visibility'] = 'hidden'
    }
})

// Calculate the percentage of an attribute
const getPercentage = (type, character) => {
    let each = 0
    let percentage = 0

    if(type === 'hp'){
        each =  character.maxHp / 100
        percentage = Math.round( Math.floor(character.hp / each) )
    }else{
        each = character.maxMp / 100
        percentage = Math.round( Math.floor(character.mp / each) )
    }

    return percentage
}

// Define what tile is walkable
const getWalkableSpace = async (characterPosition) => {

    // The max length of blocks in a straight line include the character
    const diameter = (defaultWalkableRange * 2) + 1
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

            const rowPosition = (( defaultWalkableRange - i ) >= 0? defaultWalkableRange - i : i - defaultWalkableRange) 
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

            // console.log(playerWalkableSpace)
        } 
    }


    // remove empty tile
    // for(let i = 0; i < playerWalkableSpace.length; i++){

    //     if(!playerWalkableSpace[i].length){
    //         playerWalkableSpace.splice(i, 1)
    //     }

    //     for(let block = 1; block <= playerWalkableSpace[i].length; block++){
    //         if(!playerWalkableSpace[i][block - 1].length){
    //             playerWalkableSpace[i].splice((block - 1), 1)
    //         }
    //     }
    // }
}

// An AI for enemy movement decision
const enemyAI = async() => {
    // find enemy position
    for(let i = 0; i < tileMap.map.length; i++){

        for(let block = 1; block <= tileMap.map[i].length; block++){
            if(tileMap.map[i][block - 1] === 3){
                enemyPosition.row = i
                enemyPosition.col = block - 1
            }
        }
    }

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
            const newRow = playerWalkableSpace[row][col][0]
            const newCol = playerWalkableSpace[row][col][1]

            // If it is a walkable block
            let isWalkable = tileMap.map[newRow][newCol] === 0
            let playerDetect = false

            if(isWalkable){

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
                    // If the player is at a deeper row
                    if(playerPosition.row < enemyPosition.row){

                        // move toward player if the block is a walkable one
                        if(tileMap.map[playerPosition.row - 1][playerPosition.col] !== 1){
                            // Rewrite the tile(block) as a ground
                            tileMap.map[enemyPosition.row][enemyPosition.col] = 0
                            // Get closer to the player
                            tileMap.map[playerPosition.row - 1][playerPosition.col] = 3
                            
                            // Rewrite the position
                            enemyPosition.row = newRow
                            enemyPosition.col = newCol
                
                            console.log(tileMap.map)
                            console.log(enemyPosition)                             
                        }
                        
                        // TODO - More direction checking
                    }
                                      
                }else{
                    // Go to the random selected position
                    // Rewrite the tile(block) as a ground
                    tileMap.map[enemyPosition.row][enemyPosition.col] = 0
                    tileMap.map[newRow][newCol] = 3
                    // Rewrite the position
                    enemyPosition.row = newRow
                    enemyPosition.col = newCol
        
                    console.log(tileMap.map)
                    console.log(enemyPosition)                    
                }

                // Clear the array
                playerWalkableSpace.splice(0)
                enemy.wait = true
    
                // Move to player phase
                if(enemy.wait === true) nextTurn()   
            }else{
                // keep looking
                await findXandY()
            }             
     
        }

    } 

    
    await findXandY()
   
}

//  Initialize the game
const gameLoop = () => {
    // console.log(playerPosition)

    tileMap.draw(canvas, ctx, playerWalkableSpace, (turnType)? enemyPosition : playerPosition)

    //set actionMenu wrapper width and height
    actionMenu.style.width = canvas.width + 'px';
    actionMenu.style.height = canvas.height + 'px';
}

// Move to the next phase
const nextTurn = () => {
    if(turnType === 0){
        enemy.wait = false
        turnType = 1
        enemyAI() 
    }else{
        player.wait = false
        turnType = 0
        player.ap = player.maxAp
        turn += 1
    }
}
// #endregion

// #region UI element variables and functions
// Hide UI elements
const cancelActionMenu = () => {
    actionMenu['style']['margin-left'] = -100 + '%'
}

// Get UI element and bind a click event
const actionMenu = document.getElementById('action_menu');
actionMenu.addEventListener('click', cancelActionMenu)
const actionMenuOptions = actionMenu.getElementsByTagName('li')

const characterCaption = document.getElementById('characterCaption')
const characterCaptionAttributes = ['hp', 'mp']

// action menu child click event
for(let i=0; i < actionMenuOptions.length; i++){

    switch(actionMenuOptions[i].dataset.action){
        case 'move':
            actionMenuOptions[i].addEventListener('click', async function(){
                await getWalkableSpace(playerPosition)
            })
        break;
    }
}
// #endregion


// 30 fps
setInterval(gameLoop, 1000 / 30)