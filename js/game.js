import Character from './Character.js';
import TileMap from './TileMap.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext("2d");
const canvasPosition = canvas.getBoundingClientRect();
const tileSize = 32;

const tileMap = new TileMap(tileSize)
console.log(tileMap)

var turn = 1

// 0 - player
// 1 - enemy
var turnType = 0


// player
const player = new Character('Player', 15, 10, 10, 7, 5, 5, 3)
player.setSkills('slash')
var playerPosition = {
    row: 0,
    col: 0
}
var defaultWalkableRang = 3

var playerWalkableSpace = []

// enemy
const enemy = new Character('zombie', 10, 3, 7, 5, 2, 2, 1, 1, 1)
enemy.setSkills('poison')
var enemyPosition = {
    row: 0,
    col: 0
}


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

// get mouse position and divide by tile size to see where the row and the column it clicked
canvas.addEventListener('mousedown', function(event){
    console.log(event)
    const positionY = event.clientY - canvasPosition.top
    const positionX = event.clientX - canvasPosition.left

    const row = parseInt( positionY / tileSize)
    const col = parseInt( positionX / tileSize)

    // console.log('row :>>>', row)
    // console.log('column :>>>', col)

    // if this tile is player
    if(tileMap.map[row][col] === 2){
        console.log('I am player')

        if(player.ap === 0){
            // Keep tracking where the player is on the tile map
            playerPosition.row = row
            playerPosition.col = col

            actionMenu['style']['margin-left'] = 0
        }
    }

    // If it is a walkable block
    if(playerWalkableSpace.length){

        let isWalkable = false

        for(let i=0; i < playerWalkableSpace.length; i++){

            if(isWalkable == true) break;

            for(let j = 0; j < playerWalkableSpace[i].length; j++){
                if(playerWalkableSpace[i][j][0] === col && playerWalkableSpace[i][j][1] === row){
                    isWalkable = true
                }
            }
        }

        if(isWalkable == true){
            tileMap.map[playerPosition.row][playerPosition.col] = 0
            tileMap.map[row][col] = 2
            playerPosition.row = row
            playerPosition.col = col
        }
        
        playerWalkableSpace.splice(0)
        player.ap = player.ap - 1

        if(player.ap === 0) nextTurn()
    }

    if(tileMap.map[row][col] === 3){
        console.log('I am enemy')
    }
})


// get mouse postion and divide by tile size to see where the row and the column it moved
canvas.addEventListener('mousemove', function(event){
    // console.log(event)
    const positonY = event.clientY - canvasPosition.top
    const positonX = event.clientX - canvasPosition.left

    const row = parseInt( positonY / tileSize)
    const col = parseInt( positonX / tileSize)

    // console.log('row :>>>', row)
    // console.log('column :>>>', col)

    // if this tile is player
    if(tileMap.map[row][col] === 2){

        characterCaption.firstElementChild.innerHTML = player.name
        const gauges = characterCaption.getElementsByTagName('li')

        for(let i=0; i < gauges.length; i++){
            // console.log(gauges[i].firstElementChild)
            gauges[i].firstElementChild.style.width = getPercentage(characterCaptionAttributes[i], player) + '%';
        }

        characterCaption['style']['visibility'] = 'visible'

    }else if(tileMap.map[row][col] === 3){
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

function getPercentage(type, character){
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
async function getWalkableSpace(characterPosition){

    const diameter = (defaultWalkableRang * 2) + 1
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

            const rowPosition = (( defaultWalkableRang - i ) >= 0? defaultWalkableRang - i : i - defaultWalkableRang) 
            let colPosition =  (playerWalkableSpace[i].length - 1) / 2

            // console.log(colPosition)

            if(i == 0){
                // top
                if(characterPosition.row - rowPosition >= 0 && tileMap.map[characterPosition.row - rowPosition][characterPosition.col] !== 1){
                    playerWalkableSpace[i][block - 1] = [characterPosition.col, characterPosition.row - rowPosition]  
                }    
            }else if( i === (playerWalkableSpace.length - 1)){
                
                // bottom
                if(characterPosition.row + rowPosition <= 15 && tileMap.map[characterPosition.row + rowPosition][characterPosition.col] !== 1){
                    playerWalkableSpace[i][block - 1] = [characterPosition.col, characterPosition.row + rowPosition]  
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
                    
                    if(characterPosition.row - rowPosition >= 0 && 
                        colPosition <= 8 &&
                        tileMap.map[characterPosition.row - rowPosition][colPosition] !== 1){
                        playerWalkableSpace[i][block - 1] = [colPosition, characterPosition.row - rowPosition]  
                    }
                }else if( i === 3){
                    if(characterPosition.row >=0 &&
                        colPosition <= 8 &&
                        tileMap.map[characterPosition.row][colPosition] !== -1){
                            playerWalkableSpace[i][block - 1] = [colPosition, characterPosition.row - rowPosition]  
                        }
                }
                else{

                    if(tileMap.map[characterPosition.row + rowPosition][colPosition] !== undefined){
                        if(characterPosition.row + rowPosition >= 0 &&
                            colPosition <= 8 &&
                            tileMap.map[characterPosition.row + rowPosition][colPosition] !== 1){
                            playerWalkableSpace[i][block - 1] = [colPosition, characterPosition.row + rowPosition]  
                        }                        
                    }
                    
                }
            }

            // console.log(playerWalkableSpace)
        } 
    }


    // remove empty tile
    for(let i = 0; i < playerWalkableSpace.length; i++){

        if(!playerWalkableSpace[i].length){
            playerWalkableSpace.splice(i, 1)
        }

        for(let block = 1; block <= playerWalkableSpace[i].length; block++){
            if(!playerWalkableSpace[i][block - 1].length){
                playerWalkableSpace[i].splice((block - 1), 1)
            }
        }
    }
}

function nextTurn(){
    if(turnType === 0){
        enemy.wait = false
        turnType = 1
        enemyAI() 
    }else{
        player.wait = false
        turnType = 0
        turn += 1
    }
}

async function enemyAI(){
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
            const newRow = playerWalkableSpace[row][col][1]
            const newCol = playerWalkableSpace[row][col][0]

            // If it is a walkable block
            let isWalkable = tileMap.map[newRow][newCol] === 0
            let playerDetect = false

            if(isWalkable){

                // if player is in the range
                for(let i = 0; i < playerWalkableSpace.length; i++){

                    if(playerDetect) break

                    for(let block = 1; block <= playerWalkableSpace[i].length; block++){
                        if(i === playerPosition.row && (block - 1) === playerPosition.col){
                            playerDetect = true
                        }
                    }
                }

                if(playerDetect){
                    if(playerPosition.row < enemyPosition.row){

                        // move toward player
                        if(tileMap.map[playerPosition.row - 1][playerPosition.col] !== 1){
                            tileMap.map[enemyPosition.row][enemyPosition.col] = 0
                            tileMap.map[playerPosition.row - 1][playerPosition.col] = 3
                            enemyPosition.row = newRow
                            enemyPosition.col = newCol
                
                            console.log(tileMap.map)
                            console.log(enemyPosition)                             
                        }        
                    }
                                      
                }else{
                    tileMap.map[enemyPosition.row][enemyPosition.col] = 0
                    tileMap.map[newRow][newCol] = 3
                    enemyPosition.row = newRow
                    enemyPosition.col = newCol
        
                    console.log(tileMap.map)
                    console.log(enemyPosition)                    
                }

                playerWalkableSpace.splice(0)
                enemy.wait = true
    
                if(enemy.wait === true) nextTurn()   
            }else{
                // keep looking
                await findXandY()
            }             
     
        }

    } 

    
    await findXandY()
   
}

function gameLoop(){
    // console.log(playerPosition)

    tileMap.draw(canvas, ctx, playerWalkableSpace, (turnType)? enemyPosition : playerPosition)

    //set actionMenu wrapper width and height
    actionMenu.style.width = canvas.width + 'px';
    actionMenu.style.height = canvas.height + 'px';
}

function cancelActionMenu(){
    actionMenu['style']['margin-left'] = -100 + '%'
}

// 30 fps
setInterval(gameLoop, 1000 / 30)