/**
 * 
 * @param {int} x - x axis of the start point 
 * @param {int} y - y axis of the start point
 * @param {object} target - x(col) and y(row) position of the target
 * @returns A number represent the total distance betweent start point and target
 */
export const getDistance = (x ,y, target) => {
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

/**
 * Get the distance betweenb all of available blocks and target
 * @param {object} tileMap - An object contains information about each tile
 * @param {int} x - x axis of the start point 
 * @param {int} y - y axis of the start point
 * @param {object} target - x(col) and y(row) position of the target
 * @returns An array of object contains information about each cost(distance) and the start point(available block)
 */
export const getDirections = (tileMap, x, y, target) => {
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
 * @param {object} tileMap - An object contains information about each tile
 * @param {object} currentPlayer - Current acting character
 * @param {object} target - The disire destination
 * @param {array} playerReachableDirections  - An array to collect reachable directions
 * @returns An Array of player reachable steps
 */
export const prepareDirections = async(tileMap, currentPlayer, target, playerReachableDirections) => {
    let x = currentPlayer.col, y = currentPlayer.row 

    let reachableDirections = [] 

    const getEachStep = async() => {
        reachableDirections = getDirections(tileMap, x, y, target)

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

    console.log('return player reachable Directions :>>>', playerReachableDirections)
    return playerReachableDirections
}

/**
 * Define what tile is walkable
 * @param {object} tileMap - An object contains information about each tile
 * @param {object} characterPosition - The x and y axis of the current acting character 
 * @param {number} blocksPerDirection - Number of block for each direction
 * @param {object} enemyPosition - The x and y axis of the enemy ( player or bot ) 
 * @returns An array of walkable blocks
 */
export const getAvailableSpace = async (tileMap, characterPosition, blocksPerDirection, enemyPosition = null) => {
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