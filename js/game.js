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
import level from './dataBase/level.js';
class Game{
    constructor(){
        this.ctx = canvas.getContext("2d");
        this.levels = level.getAll();
        this.levelCount = 0
        this.turn = 1;
        this.turnType = 0;
        this.velocity = 0;
        this.tileMap = null;
        this.grid = null;
        this.range = null;
        this.action = new Action('', [], [], 0, false); 
        this.option = new Option('');;
        this.player = [];
        this.playerPosition = [];
        this.enemy = [];
        this.enemyPosition = [];
        this.inspectingCharacter = null;
    }

    // Initialize the game
    // 1. Display title screen
    // 1-1. New game ---> Create character screen
    // 1-2. Load game ---> Display save slots
    // 1-3. Quit ---> Close the game
    init = async() => {
        this.option.setConfigOption(setting);

        // If there is scene to play first
        if(this.levels[this.levelCount].event[0].trigger === 'auto'){

        }else{
            // Proceed to battle phase
            this.tileMap = new TileMap(32, JSON.parse(JSON.stringify(levels[levelCount])));
            
            this.grid = new Grid(tileMap.map, 32, {});

            this.range = new Range(tileMap.map, 32);

            // Temporary solution, define player from setting
            setting.player.forEach(p => {
                const newPlayer = tileMap.getCharacter(velocity, 2, p.name, p.job)
                this.player.push(newPlayer)

            })
            
            // Sort from fastest to slowest, define acting order
            this.player.sort((a, b) => b.attributes.spd - a.attributes.spd)

            // Keep the memerizing the position for each player
            player.forEach(p => {
                playerPosition.push(
                    {
                        row: parseInt(p.y / 32),
                        col: parseInt(p.x / 32)
                    }
                )
            })

            // Define enemy from the level data
            this.tileMap.enemy.forEach(e => {
                const newPlayer = tileMap.getCharacter(velocity, 3, e.name, e.job)
                this.enemy.push(newPlayer)
            })
            
            // Sort from fastest to slowest, define acting order
            this.enemy.sort((a,b) => b.attributes.spd - a.attributes.apd)
            
            this.enemy.forEach(e => {
                this.enemyPosition.push(
                    {
                        row: parseInt(e.y / 32),
                        col: parseInt(e.x / 32)
                    }
                )
            })

            this.#setUpCanvasEvent()
            this.#gameLoop()
        }     
    }

    #setUpCanvasEvent = () => {
        // get mouse position and divide by tile size to see where the row and the column it clicked
        canvas.addEventListener('mousedown', async(event) =>{
            const { tileSize } = setting.general

            const { row, col } = getPosition(event, tileSize)

            // Hight light pointed block
            this.grid.setPointedBlock({ row, col })
            
            // If not playing animation
            if(!this.action.animationInit){
                
                // Define who is on the tile you clicked
                this.inspectingCharacter = this.player.find(p => p.y === (row * tileSize) && p.x === (col * tileSize))

                // If is not a player, checking enmey instead
                if(this.inspectingCharacter === undefined){
                    this.inspectingCharacter = this.enemy.find(e => e.y === (row * tileSize) && e.x === (col * tileSize))
                }

                let movable = false

                switch(this.action.mode){
                    case 'move':{
                        const currentActingPlayer = this.player.find(p => p.walkableSpace.length)
                    
                        const position = this.playerPosition.find(p => p.row === parseInt(currentActingPlayer.y / tileSize) && p.col === parseInt(currentActingPlayer.x / tileSize))

                        movable = action.move(this.tileMap, row, col, position, currentActingPlayer)      
                        
                        if(!movable){
                            cancelAction()
                            this.inspectingCharacter = currentActingPlayer
                        }else{
                            hideUIElement()
                        }
                    }
                    break;
                    case 'attack': case 'skill': case 'item':{
                        const currentActingPlayer = this.player.find(p => p.walkableSpace.length)
                    
                        const position = this.playerPosition.find(p => p.row === parseInt(currentActingPlayer.y / tileSize) && p.col === parseInt(currentActingPlayer.x / tileSize))
                        
                        const possibleEncounterEnemyPosition = limitPositonToCheck(currentActingPlayer.attributes.moveSpeed, position, this.enemyPosition)
                        movable = await action.command(canvas, row, col, currentActingPlayer, this.inspectingCharacter, possibleEncounterEnemyPosition, tileSize, this.tileMap)

                        if(!movable){
                            if(this.action.mode === 'skill'){
                                // Back to skill window
                                this.action.setSKillWindow(currentActingPlayer, tileMap, position)
                            }else if(this.action.mode === 'item'){
                                // Back to inventory
                                constructInventoryWindow(currentActingPlayer)
                            }else{
                                cancelAction()
                                this.inspectingCharacter = currentActingPlayer
                            }
                        }else{
                            hideUIElement()
                        }
                    }
                    break;
                    default:
                        // if this tile is player
                        if(this.inspectingCharacter?.characterType === 2){
                            console.log('I am player')

                            //Reset action menu option style
                            resetActionMenu(this.inspectingCharacter.x, this.inspectingCharacter.y)

                            this.checkAp(this.inspectingCharacter)

                            prepareCharacterCaption(this.inspectingCharacter, tileSize)

                            displayUIElement()
                            hideOptionMenu()
                        }else
                        // if this tile is enemy
                        if(this.inspectingCharacter?.characterType === 3){
                            // Fill the element with a portion of the character info
                            console.log('I am the enemy')

                            // Hide parts of action menu
                            alterActionMenu()

                            prepareCharacterCaption(this.inspectingCharacter)

                            // Open UI element
                            displayUIElement()
                            hideOptionMenu()
                        }else{
                            toggleActionMenuAndCharacterCaption()
                        }  
                    break;
                }
            }
        })
    }  
    
    // Enemy movement decision
    #enemyAI = async(currentActingEnemy, index) => {
        this.grid.setPointedBlock({ ...this.enemyPosition[index] })

        const { moveSpeed, sight } = currentActingEnemy

        const possibleEncounterPlayerPosition = limitPositonToCheck(moveSpeed, this.enemyPosition[index], this.playerPosition)

        await this.action.enemyMakeDecision(
            canvas, 
            this.tileMap, 
            this.enemyPosition[index], 
            moveSpeed, 
            sight, 
            possibleEncounterPlayerPosition.length? possibleEncounterPlayerPosition : this.playerPosition, 
            currentActingEnemy, 
            this.player
        )
    }

    #checkAp = (inspectingCharacter) => {
        // If player's ap is not enough to use skill
        if(inspectingCharacter.attributes.ap < 2){
            toggleActionMenuOption('skill', true)
        }else{
            toggleActionMenuOption('skill', false)
        }
    }

    // Game running based on browser refresh rate
    #gameLoop = () => {
        console.log('rendering')
        this.tileMap.draw(canvas, this.ctx)

        if(this.action.selectableSpace.length){
            this.range.draw(this.ctx, this.action.selectableSpace, this.action.mode, this.action.selectedSkill.type)
        }

        if(this.action.mode === 'move' && this.action.reachableDirections.length && !this.action.animationInit){
            const currentActingPlayer = (this.turnType === 0)? this.player.find(p => p.walkableSpace.length) : this.enemy.find(e => e.walkableSpace.length)
            this.action.beginAnimationPhase(currentActingPlayer)
        }

        if(this.player.length) {
            this.player.forEach(p => p.draw(this.ctx, setting.general.filter))
        }

        if(this.enemy.length){
            this.enemy.forEach(e => e.draw(this.ctx, setting.general.filter))
        }

        if(setting.general.showGrid){
            this.grid.draw(this.ctx)
        }

        // Form a loop for rendering
        window.requestAnimationFrame(this.gameLoop)
    }

    // Move to the next phase
    #nextTurn = (index) => {
        togglePhaseTranistion(this.turnType)

        setTimeout(() => {
            if(this.turnType === 0){
                if(this.enemy.length){
                    console.log('enemy phase')
                    this.turnType = 1
                    this.enemy[index].attributes.ap = this.enemy[index].attributes.maxAp
                    this.#enemyAI(this.enemy[index])                 
                }else{
                    this.turnType = 1
                    this.#nextTurn()
                    // TODO: Display result screen
                }
            }else{
                if(this.player.length){
                    console.log('player phase')
                    this.turnType = 0
                    this.player[index].attributes.ap = this.player[index].attributes.maxAp
                    this.grid.setPointedBlock({ ...this.playerPosition[index] })
                    this.turn += 1 
                    countTurn(this.turn)               
                }else{
                    this.turnType = 0
                    this.#nextTurn()
                    // TODO: Display result screen
                }
            }            
        }, 1500)
    }

    // Check the content of dropped items
    checkDroppedItem = async(dropItems) => {
        const playerHasKey = false
        const dropKey = dropItems.findIndex(i => i.id.includes('key')) >= 0
    
        for(let i=0; i < this.player.length; i++){
            if(this.player[i].bag.findIndex(i => i.id.includes('key')) >= 0){
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
    checkIfStepOnTheEvent = async(x, y) => {
        const event = this.tileMap.event.find(e => e.position.x === x && e.position.y === y && e.trigger === 'stepOn')
    
        if(event !== undefined){
            toggleActionMenuOption('pick', false, 'event')
        }
    
        return event
    }

    /**
     * Limit enemy position to check in a range based on player selectable space
     * @param {number} range - A number of tiles a character can reach per direction 
     * @param {object} position - An object contains character current position
     * @param {object} targets - An Array of object contains character / enemy position
     * @returns  An Array of filtered enemyPosition
     */
    limitPositonToCheck = (range, position, targets) => {
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
    characterAnimationPhaseEnded = async(currentActingPlayer) => {
        const { tileSize } = setting.general
        // if(enemy === null){
        //     // Level clear
        //     // Play secene
        // }else{
     
        // }
    
        // If it is the player's turn
        if(this.turnType === 0){
            const index = this.player.findIndex(p => p.animation === currentActingPlayer.animation)
            this.playerPosition[index].row = parseInt(currentActingPlayer.y / tileSize)
            this.playerPosition[index].col = parseInt(currentActingPlayer.x / tileSize)  
    
            // Check if the tile has an event
            await this.checkIfStepOnTheEvent(currentActingPlayer.x, currentActingPlayer.y)
    
            currentActingPlayer.animation = ''
            prepareCharacterCaption(currentActingPlayer)
    
            // If the player is ran out of action point, move to the enemy phase
            if(currentActingPlayer.attributes.ap === 0) {
                this.grid.setPointedBlock({})
                currentActingPlayer.wait = true
                currentActingPlayer.setWalkableSpace([])
                nextTurn(0)
            }else{
                this.grid.setPointedBlock({ ...this.playerPosition[index] })
                this.inspectingCharacter = currentActingPlayer
                this.#checkAp(currentActingPlayer)
                // Display Action options
                displayUIElement()
            }
    
            this.action.mode = ''
            console.log('reset action mode :>>>', this.action.mode)
        }else{
            const index = this.enemy.findIndex(e => e.animation === currentActingPlayer.animation)
            this.enemyPosition[index].row = parseInt(currentActingPlayer.y / tileSize)
            this.enemyPosition[index].col = parseInt(currentActingPlayer.x / tileSize) 
            // characterAp.innerText = `AP: ${player.attributes.ap}`
                
            // Move to the next phase
            if(currentActingPlayer.attributes.ap === 0){
                this.action.mode = ''
                console.log('reset action mode :>>>', this.action.mode)
                this.grid.setPointedBlock({})
                currentActingPlayer.wait = true
                currentActingPlayer.setWalkableSpace([])
                // Check if the others run out of ap also
                if(this.enemy[index + 1] !== undefined){
                    await this.#enemyAI(this.enemy[index + 1])
                    console.log('next enemy start moving')
                }else{
                    this.#nextTurn(0)                
                }            
            }else{
                this.grid.setPointedBlock({ ...this.enemyPosition[index] })
                // keep looking
                await this.#enemyAI(index)
                console.log('enemyAI keep looking')
            }         
        } 
    }

    removeCharacter = (type, id) => {
        switch(type){
            case 2:{
                const index = this.player.findIndex(p => p.id === id)
                this.player.splice(index, 1)
                this.playerPosition.splice(index, 1)
            }
            break;
            case 3:{
                const index = enemy.findIndex(e => e.id === id)
                this.enemy.splice(index, 1)
                this.enemyPosition.splice(index, 1)
            }
            break
        }
    }
}

// #endregion
// window.addEventListener('orientationchange', resize, false);

// 30 fps
// setInterval(gameLoop, 1000 / 30)

const game = new Game()

await game.init()

export default game

resize()
window.addEventListener('resize', resize, false);
