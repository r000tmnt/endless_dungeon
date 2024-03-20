import TileMap from './TileMap.js';
import Grid from './grid.js';
import Action from './action.js';
import Range from './range.js';
import Option from './option.js';
import TextBox from './textBox.js';
import Audio from './audio.js';

import { 
    uiInit,
    canvas, 
    resize, 
    getPosition, 
    resetActionMenu, 
    alterActionMenu,
    hideOptionMenu,
    toggleOptionMenu,
    toggleActionMenuAndCharacterCaption,
    toggleActionMenuOption,
    togglePhaseTransition,
    prepareCharacterCaption,
    displayUIElement,
    hideUIElement,
    cancelAction,
    countTurn,
    redefineDeviceWidth,
    redefineFontSize,
    displayResult,
    toggleTurnElement,
    displayTitleScreen,
    setCanvasPosition,
    setBattlePhaseUIElement,
    alterPhaseTransitionStyle,
    toggleLoadingScreen,
    toggleCanvas,
    prepareInventory
} from './utils/ui.js'
// import { getItemType } from './utils/inventory.js'
import { levelUp } from './utils/battle.js'

import setting from './utils/setting.js';
import weapon from './dataBase/item/item_weapon';
import armor from './dataBase/item/item_armor';

class Game{
    constructor(){
        this.ctx = canvas.getContext("2d");
        this.level = null;
        this.phaseCount = 0;
        this.turn = 1;
        this.turnType = 0;
        this.velocity = 1;
        this.tileMap = null;
        this.grid = null;
        this.range = null;
        this.action = new Action('', [], [], 0, false); 
        this.option = new Option('');
        this.textBox = null;
        this.player = [];
        this.playerPosition = [];
        this.enemy = [];
        this.enemyPosition = [];
        this.inspectingCharacter = null;
        this.eventEffect = []; // What effect will take when move into battle phase
        this.stash = []; // A shared stash
        this.stashLimit = 1000;
        this.stepOnEvent = {}; // The event waiting to be trigger

        // Canvas mouse down event
        this.canvasEvent = async(event) => {
            const { tileSize, fontSize, fontSize_sm } = setting.general

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

                        movable = this.action.move(this.tileMap, row, col, position, currentActingPlayer)  
                        
                        movable.then(result => {
                            console.log(result)
                                                    
                            if(!result){
                                cancelAction()
                                this.inspectingCharacter = currentActingPlayer
                            }else{
                                hideUIElement()
                            }
                        })
                    }
                    break;
                    case 'attack': case 'skill': case 'item':{
                        const currentActingPlayer = this.player.find(p => p.walkableSpace.length)
                    
                        const position = this.playerPosition.find(p => p.row === parseInt(currentActingPlayer.y / tileSize) && p.col === parseInt(currentActingPlayer.x / tileSize))
                        
                        const possibleEncounterEnemyPosition = this.limitPositonToCheck(currentActingPlayer.attributes.moveSpeed, position, this.enemyPosition)
                        movable = await this.action.command(canvas, row, col, currentActingPlayer, this.inspectingCharacter, possibleEncounterEnemyPosition, tileSize, this.tileMap)

                        if(!movable){
                            if(this.action.mode === 'skill'){
                                // Back to skill window
                                this.action.setSKillWindow(currentActingPlayer, this.tileMap, position)
                            }else if(this.action.mode === 'item'){
                                // Back to inventory
                                this.inspectingCharacter = currentActingPlayer
                                prepareInventory(currentActingPlayer)
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
                        if(this.inspectingCharacter?.type === 2){
                            console.log('I am player')

                            //Reset action menu option style
                            resetActionMenu(this.inspectingCharacter.x, this.inspectingCharacter.y)

                            this.#checkAp(this.inspectingCharacter)

                            prepareCharacterCaption(this.inspectingCharacter, tileSize)

                            displayUIElement()
                            hideOptionMenu()
                        }else
                        // if this tile is enemy
                        if(this.inspectingCharacter?.type === 3){
                            // Fill the element with a portion of the character info
                            console.log('I am the enemy')

                            // Hide parts of action menu
                            alterActionMenu()

                            prepareCharacterCaption(this.inspectingCharacter)

                            // Open UI element
                            displayUIElement()
                            hideOptionMenu()
                        }else{
                            toggleOptionMenu()
                            toggleActionMenuAndCharacterCaption()
                        }  
                    break;
                }
            }
        };

        // Audio
        this.bgAudio = null;
        this.clickSound = null;
        this.menuOpenSound = null;
        this.menuCloseSound = null;
        this.actionSelectSound = null;
        this.attackSound = null;
        this.potionSound = null;
        this.walkingSound = null;
        this.equipSound = null;
        this.unEquipSound = null;
        this.keySound = null;
        this.selectSound = null;
    }

    // Initialize the game
    // 1. Display title screen
    // 1-1. New game ---> Create character screen
    // 1-2. Load game ---> Display save slots
    // 1-3. Quit ---> Close the game
    init = async() => {
        this.option.setConfigOption(setting);

        // Define sound effects
        game.menuOpenSound = new Audio(`${__BASE_URL__}assets/audio/menu_selection.mp3`, 'interface')
        game.menuCloseSound = new Audio(`${__BASE_URL__}assets/audio/menu_close.mp3`, 'interface')
        game.actionSelectSound = new Audio(`${__BASE_URL__}assets/audio/action_select.mp3`, 'interface')
        
        displayTitleScreen()
        // this.beginNextPhase()
    }

    beginNextPhase(){
        if(this.phaseCount > (this.level.phase.length - 1)){
            this.phaseCount = 0
            // Load the next level
        }else{
            switch(this.level.phase[this.phaseCount]){
                case 'conversation':
                    const { cameraWidth, cameraHeight } = redefineDeviceWidth()
                    const { fontSize, fontSize_md, fontSize_sm } = redefineFontSize(cameraWidth)

                    if(this.textBox !== null){
                        this.textBox.event = this.level.event[0].scene
                    }else{
                        // Defined textBox object and event for the first load
                        this.textBox = new TextBox(this.level.event[0].scene)
                        this.textBox.setConversationEvent(cameraWidth, cameraHeight, fontSize_md)
                    }
        
                    this.textBox.setConversationWindow(cameraWidth, cameraHeight, fontSize, fontSize_md, fontSize_sm)
                break;
                case 'titleCard':
                    // If the next phase is a battle
                    if(this.level.phase[this.phaseCount + 1] === 'battle'){
                    // cover up screen
                    toggleLoadingScreen(true)
                    // Preparing battle phase
                    this.phaseCount += 1
                    this.beginNextPhase()

                    // Display canvas if ready
                    const canvasReady = setInterval(() => {
                        // Make sure every thing is loaded
                        if(this.tileMap.ready && this.grid !== null){
                            const playerReady = this.player.filter(p => p.characterImage.src.length > 0 && p.ready)
                            const enemyReady = this.enemy.filter(e => e.characterImage.src.length > 0 && e.ready)

                            // console.log(this.player[0].ready)

                            if(playerReady.length === this.player.length && enemyReady.length === this.enemy.length){
                                clearInterval(canvasReady)

                                // Hide loading screen
                                toggleLoadingScreen(false)

                                alterPhaseTransitionStyle('rgb(0, 0, 0)')
                                // Display the title of the level
                                togglePhaseTransition(`${this.level.id}\n${this.level.name}`, 1500)

                                // Display canvas
                                setTimeout(() => {
                                    toggleCanvas(true)
                                    toggleTurnElement(true)

                                    setTimeout(() => {
                                        // Simulate click on the canvas where the first moving character is 
                                        this.#clickOnPlayer(0)
                                    }, 700) 
                                }, 1800)
            
                                setTimeout(() => {
                                    alterPhaseTransitionStyle('rgba(0, 0, 0, 0.7)')
                                }, 2000)                         
                            }
                        }
                    }, 100)
                    }else{
                        // Display the title of the level
                        togglePhaseTransition(`${this.level.id}\n${this.level.name}`, 1500)

                        // Begin next phase
                        setTimeout(() => {
                            this.phaseCount += 1
                            this.beginNextPhase()
                        }, 2000)
                    }
                break;
                case 'battle':
                    this.#initBattlePhase()
                break;
                case 'intermission':
                break;
                case 'end':
                    toggleCanvas(false)
                    displayTitleScreen()
                    this.phaseCount += 1
                break;
            }
        }
    }

    #createCharacter = (source, property, position, type, tileSize) => {
        source.forEach((p) => {
            const newPlayer = this.tileMap.getCharacter(this.velocity, type, p.name, p.job)
            property.push(newPlayer)
        })
        
        // Sort from fastest to slowest, define acting order
        property.sort((a, b) => b.attributes.spd - a.attributes.spd)

        // Keep the memorizing the position for each player
        property.forEach(p => {
            position.push(
                {
                    row: parseInt(p.y / tileSize),
                    col: parseInt(p.x / tileSize)
                }
            )
        })  
    }

    #initBattlePhase = () => {
        // Proceed to battle phase
        const { tileSize } = setting.general

        const cameraWidth = setting.general.camera.width

        const { fontSize, fontSize_md, fontSize_sm } = redefineFontSize(cameraWidth)

        this.tileMap = new TileMap(tileSize, this.level);

        this.grid = new Grid(this.tileMap.map, tileSize, {});

        this.range = new Range(this.tileMap.map, tileSize);

        this.action.setFontSize(Math.floor(fontSize * 2))

        setCanvasPosition(tileSize)

        setBattlePhaseUIElement(cameraWidth, fontSize, fontSize_md, fontSize_sm)

        // Temporary solution, define player from setting
        if(!this.player.length){
            this.#createCharacter(setting.player, this.player, this.playerPosition, 2, tileSize)
        }

        if(!this.enemy.length){
            this.#createCharacter(this.tileMap.enemy, this.enemy, this.enemyPosition, 3, tileSize)       
        }

        if(this.eventEffect.length){
            this.#applyOptionEffect(this.eventEffect)
        }

        this.#gameLoop()

        this.#setUpCanvasEvent()
    }

    #setUpCanvasEvent = () => {
        // get mouse position and divide by tile size to see where the row and the column it clicked
        canvas.addEventListener('mousedown', this.canvasEvent)
    }  
    
    // Enemy movement decision
    #enemyAI = async(currentActingEnemy, index) => {
        this.grid.setPointedBlock({ ...this.enemyPosition[index] })

        const { moveSpeed, sight } = currentActingEnemy.attributes

        const possibleEncounterPlayerPosition = this.limitPositonToCheck(moveSpeed, this.enemyPosition[index], this.playerPosition)

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

        if(this.action.mode === 'move'){
            if(this.action.reachableDirections.length && !this.action.animationInit){
                const currentActingPlayer = (this.turnType === 0)? this.player.find(p => p.walkableSpace.length) : this.enemy.find(e => e.walkableSpace.length)
                this.action.beginAnimationPhase(currentActingPlayer)                
            }
        }

        this.player.forEach(p => p.draw(this.ctx, setting.general.filter))

        this.enemy.forEach(e => e.draw(this.ctx, setting.general.filter))

        if(setting.general.showGrid){
            this.grid.draw(this.ctx)
        }

        // Form a loop for rendering
        window.requestAnimationFrame(this.#gameLoop)
    }

    // Move to the next phase
    #nextTurn = (index) => {
        togglePhaseTransition((this.turnType === 0)? 'Enemy Phase' : 'Player Phase', 1000)

        setTimeout(() => {
            if(this.turnType === 0){
                if(this.enemy.length){
                    console.log('enemy phase')
                    this.turnType = 1
                    this.enemy[index].attributes.ap = this.enemy[index].attributes.maxAp

                    // Check if there is status effect on enemy
                    // this.enemy.map(e => {})

                    this.#enemyAI(this.enemy[index], index)                 
                }
            }else{
                if(this.player.length){
                    console.log('player phase')
                    this.turnType = 0
                    this.player[index].attributes.ap = this.player[index].attributes.maxAp
                    this.turn += 1 
                    countTurn(this.turn)

                    // Check if there is status effect on player
                    // this.player.map(p => {})

                    // Simulate canvas click where the current acting character is
                    this.#clickOnPlayer(index)
                }
            }            
        }, 1500)
    }

    // Apply effects to the target if any
    #applyOptionEffect = (effect) => {       
        for(let j=0; j < effect.length; j++){
            const target = effect[j].target.split('_')
            switch(target[0]){
                case 'player':
                    const targetedPlayer = this.player.find(p => p.name === setting.player[Number(target[1]) - 1].name)
                    switch(effect[j].attribute){
                        case 'equip':{
                            let itemData = {}
                            switch(effect[j].type){
                                case 3:
                                    itemData = weapon.getOne(effect[j].value)
                                break;
                                case 4:
                                    itemData = armor.getOne(effect[j].value)
                                break;
                            } 

                            targetedPlayer.equip[itemData.position] = {
                                id: itemData.id,
                                name: itemData.name
                            }
                            
                            targetedPlayer.bag.push({
                                id: itemData.id,
                                type: effect[j].type,
                                amount: 1
                            })

                            // Change attribute value
                            for(let [key, val] of Object.entries(itemData.effect.base_attribute)){
                                targetedPlayer.attributes[key] += itemData.effect.base_attribute[key]
                            }
                        }
                        break;
                        case 'status':
                            targetedPlayer.attributes[effect[j].attribute] = effect[j].value     
                        break;
                        default:
                            targetedPlayer.attributes[effect[j].attribute] += effect[j].value                                                
                        break;
                    }
                break;
                case 'enemy':
                    const targetedEnemy = this.enemy.find(p => p.name === this.tileMap.enemy[Number(target[1]) - 1].name)
                    switch(effect[j].attribute){
                        case 'equip':{
                            let itemData = {}

                            switch(effect[j].type){
                                case 3:
                                    itemData = weapon.getOne(effect[j].value)  
                                break;
                                case 4:
                                    itemData = armor.getOne(effect[j].value)
                                break;
                            } 

                            targetedEnemy.equip[itemData.position] = {
                                id: itemData.id,
                                name: itemData.name
                            } 

                            targetedEnemy.drop.push({
                                id: itemData.id,
                                type: effect[j].type,
                                amount: 1
                            })

                            // Change attribute value
                            for(let [key, val] of Object.entries(itemData.effect.base_attribute)){
                                targetedEnemy.attributes[key] += itemData.effect.base_attribute[key]
                            }
                        }
                        break;
                        case 'status':
                            targetedEnemy.attributes[effect[j].attribute] = effect[j].value     
                        break;
                        default:
                            targetedEnemy.attributes[effect[j].attribute] += effect[j].value                                                
                        break;
                    }
                break;
            }
        }

        this.eventEffect.splice(0)
    }

    // Win or lose
    #winOrLose = () => {
        let result = ''

        // Check if victory
        switch(this.tileMap.objective.victory.target){
            case 'enemy':
                if(this.enemy.length === this.tileMap.objective.victory.value){
                    result = 'win'
                }
            break;
        }

        // Check if fail
        switch(this.tileMap.objective.fail.target){
            case 'player':
                if(this.player.length === this.tileMap.objective.fail.value){
                    result = 'fail'
                }
            break;
        }

        return result
    }

    // Simulate canvas click on where the player is
    #clickOnPlayer = (index) => {
        this.grid.setPointedBlock({...this.playerPosition[index]})
        this.inspectingCharacter = this.player[index]  
        this.checkIfStepOnTheEvent(this.inspectingCharacter.x, this.inspectingCharacter.y)
        prepareCharacterCaption(this.inspectingCharacter, setting.tileSize)
        this.#checkAp(this.inspectingCharacter)                   
        displayUIElement()
    }
 
    // Check the content of dropped items
    checkDroppedItem = async(dropItems) => {
        let playerHasKey = false
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
        const event = this.tileMap.getEventOnTile({x, y})
    
        if(event !== undefined){
            this.stepOnEvent = event
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

        // Check if player win or lose
        const situation = this.#winOrLose()
        console.log('win or lose :>>>', situation)
        if(situation.length){
            if(situation === 'win'){
                // Get stage clear bonus
                const { optional } = this.level.objective
                
                if(!Object.entries(this.stepOnEvent).length){
                    this.stepOnEvent['item'] = []
                }

                for(let i=0; i < optional.length; i++){
                    const { target, value, prize } = optional[i]
                    switch(target){
                        case 'turn':
                            if(this.turn <= value){
                                for(let j=0; j < prize.length; j++){
                                    if(prize[j].id.includes('exp')){
                                        this.player.map(p => {
                                            p.exp += prize[j].amount

                                            if(p.exp >= p.requiredExp){
                                                levelUp(p)
                                            }
                                        })
                                    }else{
                                        this.stepOnEvent.item.push({...prize[j]})
                                    }
                                }
                            }
                        break;
                    }
                }

                // Get all the remaining items on the ground
                const { event } = this.tileMap
                
                for(let i=0; i < event.length; i++){
                    if(event[i].trigger !== 'auto'){
                        for(let j=0; j < event[i].item.length; j++){
                            this.stepOnEvent.item.push({...event[i].item[j]})
                        }
                    }
                }

                // Proceed to the next phase
                // this.phaseCount += 1
                // this.beginNextPhase()
            }

            // Display battle result
            displayResult(situation === 'win')
        }else{
            // If it is the player's turn
            if(this.turnType === 0){
                const index = this.player.findIndex(p => p.animation === currentActingPlayer.animation)
                this.playerPosition[index].row = parseInt(currentActingPlayer.y / tileSize)
                this.playerPosition[index].col = parseInt(currentActingPlayer.x / tileSize)  
        
                // Check if the tile has an event
                // await this.checkIfStepOnTheEvent(currentActingPlayer.x, currentActingPlayer.y)
        
                // currentActingPlayer.animation = 'idle'
                currentActingPlayer.animationFrame = 0
                currentActingPlayer.colorFrame = 0
                // prepareCharacterCaption(currentActingPlayer)
        
                // If the player is ran out of action point
                // Check if the next player exist 
                // If not, move to the enemy phase
                if(currentActingPlayer.attributes.ap === 0) {
                    if(this.player[index + 1] !== undefined){
                        // Simulate click on canvas where the next player is
                        this.#clickOnPlayer(index + 1)
                    }else{
                        this.grid.setPointedBlock({})
                        currentActingPlayer.wait = true
                        currentActingPlayer.setWalkableSpace([])
                        this.#nextTurn(0)                        
                    }
                }else{
                    // Simulate click on canvas where the current player is
                    this.#clickOnPlayer(index)
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
                        await this.#enemyAI(this.enemy[index + 1], index + 1)
                        console.log('next enemy start moving')
                    }else{
                        this.#nextTurn(0)                
                    }            
                }else{
                    this.grid.setPointedBlock({ ...this.enemyPosition[index] })
                    // keep looking
                    await this.#enemyAI(this.enemy[index], index)
                    console.log('enemyAI keep looking')
                }         
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
                const index = this.enemy.findIndex(e => e.id === id)
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

uiInit(game)

export default game

resize()
window.addEventListener('resize', resize, false);
