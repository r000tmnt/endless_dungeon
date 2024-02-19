import {
    constructInventoryWindow, 
    constructPickUpWindow,
    resizeInventory, 
    clearInventory, 
    resizePickUp, 
    clearPickUpWindow 
} from './inventory.js'

import setting from './setting.js';
import game from '../game.js';

// Get UI element and bind a click event
const aspectRatio = 9 / 16

// #region Canvas element
export let canvas = document.getElementById('game');

let canvasPosition

const appWrapper = document.getElementById('wrapper')
const turnCounter = document.getElementById('turn')
turnCounter.innerText = 'Turn 1'
turnCounter.classList.add('invisible')

const phaseWrapper = document.getElementById('Phase_Transition');
const phaseElement = document.getElementById('phase');

// Actiom menu UI
const actionMenu = document.getElementById('action_menu');
const actionMenuOptions = actionMenu.getElementsByTagName('li')

// Option menu UI
const option_menu = document.getElementById('option_menu')
const options = option_menu.getElementsByTagName('li')

// Character caption UI
const characterCaption = document.getElementById('characterCaption')
const characterName = document.getElementById('name')
const characterLv = document.getElementById('lv')
const characterAp = document.getElementById('ap')
const characterCaptionAttributes = ['hp', 'mp']
const gauges = document.querySelectorAll('.gauge')

// Status UI
const statusWindow = document.getElementById('status')
const avatar = document.getElementById('avatar')

const backBtn = document.getElementsByClassName('back')

// Inventory UI
const Inventory = document.getElementById('item')
const pickUpWindow = document.getElementById('pickUp')

// Skill UI
const skillWindow = document.getElementById('skill')

// Party UI
const partyWindow = document.getElementById('party')

// Config UI
const configWindow = document.getElementById('config')

// Objective UI
const objectiveWindow = document.getElementById('objective')

// UI after Battle finished
const levelClear = document.getElementById('levelClear')

// option menu child click event
for(let i=0; i < options.length; i++){
    switch(options[i].dataset.option){
        case 'party':
            options[i].addEventListener('click', () => {
                game.option.mode = 'party'
                game.option.setPartyWindow(game.player, setting, game.action)
                partyWindow.classList.remove('invisible')
                partyWindow.classList.add('open_window')
            })
        break;
        case 'objective':
            options[i].addEventListener('click', () => {
                game.option.mode = 'objective'
                game.option.setObjectiveWindow(objectiveWindow, setting, game.tileMap.objective)
            })
        break;
        case 'config':
            options[i].addEventListener('click', () => {
                game.option.mode = 'config'
                game.option.setConfigWindow(setting)
                configWindow.classList.remove('invisible')
                configWindow.classList.add('open_window')
            })
        break;
        case 'end':
            options[i].addEventListener('click', () => {
                game.player.forEach(p => {
                    p.attributes.ap = 0
                    p.wait = true
                })
                game.characterAnimationPhaseEnded(game.player[0])
                option_menu.classList.remove('action_menu_open')
            })
        break;
    }
}

// Back button click event
for(let i=0; i < backBtn.length; i++){
    switch(backBtn[i].dataset.action){
        case 'skill':
            backBtn[i].addEventListener('click', async() => {
                game.action.mode = ''
                // await checkIfStepOnTheEvent(game.inspectingCharacter.x, game.inspectingCharacter.y)
                skillWindow.classList.add('invisible')
                skillWindow.classList.remove('open_window')
                game.action.clearSkillWindow(skillWindow.style)
                // if(game.inspectingCharacter){
                //     prepareCharacterCaption(game.inspectingCharacter) 
                //  }
                displayUIElement()
            })
        break;
        case 'status':
            backBtn[i].addEventListener('click', async() => {
                game.action.mode = ''
                // await checkIfStepOnTheEvent(game.inspectingCharacter.x, game.inspectingCharacter.y)
                statusWindow.classList.add('invisible')
                statusWindow.classList.remove('open_window')
                game.action.resetStatusWindow(statusWindow.style)

                if(game?.inspectingCharacter?.id){
                    prepareCharacterCaption(game.inspectingCharacter) 
                    displayUIElement()                    
                }
            })
        break;
        case 'item':
            backBtn[i].addEventListener('click', async() => {
                game.action.mode = ''
                // Check if the tile has an event
                await game.checkIfStepOnTheEvent(game.inspectingCharacter.x, game.inspectingCharacter.y)
                Inventory.classList.add('invisible')
                Inventory.classList.remove('open_window')
                clearInventory(Inventory.style)
                prepareCharacterCaption(game.inspectingCharacter)
                displayUIElement()
            })
        break;
        case 'pick':
            backBtn[i].addEventListener('click', async() => {
                game.action.mode = ''
                // Check if the tile has an event
                await checkIfStepOnTheEvent(game.inspectingCharacter.x, game.inspectingCharacter.y)
                pickUpWindow.classList.add('invisible')
                pickUpWindow.classList.remove('open_window')
                clearPickUpWindow(pickUpWindow.style)
                prepareCharacterCaption(game.inspectingCharacter)
                displayUIElement()
            })
        break;
        case 'party':
            backBtn[i].addEventListener('click', () => {
                partyWindow.classList.add('invisible')
                partyWindow.classList.remove('open_window')
                game.option.mode = ''
                game.option.cleatPartyWindow(partyWindow.style)
            })
        break;
        case 'objective':
            backBtn[i].addEventListener('click', () => {
                game.option.mode = ''
                objectiveWindow.classList.add('invisible')
                objectiveWindow.classList.remove('open_window')
            })
        break;
        case 'config':
            backBtn[i].addEventListener('click', () => {
                game.option.mode = ''
                configWindow.classList.add('invisible')
                configWindow.classList.remove('open_window')
            })
        break;
    }
}

// action menu child click event
for(let i=0; i < actionMenuOptions.length; i++){
    switch(actionMenuOptions[i].dataset.action){
        case 'move':
            actionMenuOptions[i].addEventListener('click', async() => {
                hideUIElement() 
                const { tileSize } = setting.general
                const position = game.playerPosition.find(p => p.row === parseInt(game.inspectingCharacter.y / tileSize) && p.col === parseInt(game.inspectingCharacter.x / tileSize))
                const possibleEncounterEnemyPosition = game.limitPositonToCheck(game.inspectingCharacter.attributes.moveSpeed, position, game.enemyPosition)
                await game.action.setMove(
                    game.tileMap, 
                    game.inspectingCharacter, 
                    position, 
                    game.inspectingCharacter.attributes.moveSpeed, possibleEncounterEnemyPosition.length? possibleEncounterEnemyPosition : game.enemyPosition
                )           
            })
        break;
        case 'attack':
            actionMenuOptions[i].addEventListener('click', async() => {
                hideUIElement() 
                const { tileSize } = setting.general
                const position = game.playerPosition.find(p => p.row === parseInt(game.inspectingCharacter.y / tileSize) && p.col === parseInt(game.inspectingCharacter.x / tileSize))
                await game.action.setAttack(game.tileMap, game.inspectingCharacter, position, 1)
            })
        break;   
        case "skill":
            actionMenuOptions[i].addEventListener('click', () => {
                hideUIElement()
                const { tileSize, fontSize, fontSize_md, fontSize_sm, camera } = setting.general
                const { width, height } = camera
                resizeHiddenElement(skillWindow.style, width, height, fontSize_sm)
                const position = game.playerPosition.find(p => p.row === parseInt(game.inspectingCharacter.y / tileSize) && p.col === parseInt(game.inspectingCharacter.x / tileSize))
                game.action.setSKillWindow(game.inspectingCharacter, game.tileMap, position, fontSize, fontSize_md, fontSize_sm)
            })
        break;
        case 'item':
            actionMenuOptions[i].addEventListener('click', async() => {
                hideUIElement()
                game.action.mode = 'item'
                const { fontSize, fontSize_sm, camera } = setting.general
                const { width, height } = camera
                const { itemBlockSize, itemBlockMargin } = setting.inventory
                resizeHiddenElement(Inventory.style, width, height, fontSize_sm)
                constructInventoryWindow(game.inspectingCharacter, game.enemyPosition, game.tileMap, fontSize, fontSize_sm, itemBlockSize, itemBlockMargin, width)
            })
        break; 
        case 'pick':
            actionMenuOptions[i].addEventListener('click', () => {
                preparePickUpWindow()
            })
        break;
        case 'pickAfterBattle':
            // Choose which character to take items if there's more then one in the party

            // const partySubWindow = 

        break;
        case 'status':
            actionMenuOptions[i].addEventListener('click', () => {
                hideUIElement()
                const { fontSize, fontSize_md, fontSize_sm, camera } = setting.general
                const { width, height } = camera
                resizeHiddenElement(statusWindow.style, width, height, fontSize_sm)
                game.action.setStatusWindow(game.inspectingCharacter, fontSize, fontSize_md, fontSize_sm, width)
            })
        break;
        case 'stay':
            actionMenuOptions[i].addEventListener('click', async() => {
                hideUIElement()
                setTimeout(() => {
                    game.inspectingCharacter.attributes.ap -= 1
                    game.characterAnimationPhaseEnded(game.inspectingCharacter)
                }, 500)
            })
    }
}

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

export const displayResult = (win) => {

    const title = levelClear.firstChild

    if(win){
        title.innerText = "Victory"

        const optional = levelClear.querySelector('#optional')

        if(game.tileMap.objective.optional.length){
            game.tileMap.objective.optional.map(o => {
                const condition = document.createElement('li')
                if(o.target === 'turn'){
                    condition.innerText = `Finish the level in ${o.value} turns\n`

                    if(game.turn <= o.value){
                        setTimeout(() => {
                            const clear = document.createElement('span')
                            clear.innerHTML = '&#10003;'
                            clear.style.color = 'yellow'

                            condition.append(clear)
                        }, 500)
                    }

                    optional.append(condition)
                } 
            })            
        }else{
            optional.innerHTML = 'No more objective'
        }

        setTimeout(() => {
            optional.style.transformX = -100 + '%'
            levelClear.querySelector('.action').classList.remove('invisible')
        }, 1000)
    }else{
        title.innerText = 'Game Over'

        setTimeout(() => {
            levelClear.querySelector('.tap').classList.remove('invisible')
        }, 1000)        
    }

    levelClear.classList.remove('invisible')
}

export const preparePickUpWindow = () => {
    hideUIElement()
    game.action.mode = 'pick'
    const { fontSize, fontSize_sm, camera } = setting.general
    const { width, height } = camera
    const { itemBlockSize, itemBlockMargin } = setting.inventory
    resizeHiddenElement(pickUpWindow.style, width, height, fontSize_sm)
    constructPickUpWindow(game.inspectingCharacter, width, game.stepOnEvent.item, game.tileMap, fontSize, fontSize_sm, itemBlockSize, itemBlockMargin)
}

export const resizeHiddenElement = (target, width, height, size) => {
    target.padding = size + 'px'
    target.width = width + 'px'
    target.height = height + 'px'
}

export const countTurn = (turn) => {
    turnCounter.innerText = `Turn ${turn}` 
}

export const togglePhaseTransition = (text, time) => {
    phaseElement.innerText = text
    // Phase transition fade in
    phaseWrapper.classList.add('fade_in')
    // Phase transition fade out
    setTimeout(() => {
        phaseWrapper.classList.add('fade_out')
    }, time)

    setTimeout(() => {
        phaseWrapper.classList.remove('fade_in')
        phaseWrapper.classList.remove('fade_out') 
    }, time + 500);
}

export const hideUIElement = () => {
    actionMenu.classList.remove('action_menu_open')
    characterCaption.classList.add('invisible') 
}

export const cancelAction = () => {
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

    action.mode = ''  
}

export const displayUIElement = () => {
    actionMenu.classList.add('action_menu_open')
    characterCaption.classList.remove('invisible') 
}

export const prepareCharacterCaption = (inspectingCharacter, tileSize) => {
    // Fill the element with a portion of the character info
    characterName.innerText = inspectingCharacter.name
    characterLv.innerText = `LV ${inspectingCharacter.lv}`
    characterAp.innerText = `AP: ${inspectingCharacter.attributes.ap}`

    // Display arrow symbol if there are points to spend
    if(inspectingCharacter.pt > 0){
        const hint = document.querySelector('.hint')
        hint.style.fontSize = setting.general.fontSize_sm + 'px'
        hint.style.display = 'block'
    }else{
        // Hide arrow symbol
        const hint = document.querySelector('.hint')
        hint.style.display = 'none'
    }

    // calculation the percentage of the attribute
    for(let i=0; i < gauges.length; i++){
        // console.log(gauges[i].firstElementChild)
        gauges[i].firstElementChild.style.width = getPercentage(characterCaptionAttributes[i], inspectingCharacter) + '%';
    }

    const position = (inspectingCharacter.characterType === 2)? game.playerPosition[game.player.findIndex(p => p.id === inspectingCharacter.id)] : game.enemyPosition[game.enemy.findIndex(e => e.id === inspectingCharacter.id)]

    // Shift UI position based on the character position
    if(position.row > 7 && position.col < Math.floor(9/2)){
        characterCaption.style.left = ((tileSize * 9) - characterCaption.clientWidth) + 'px'
    }else{
        characterCaption.style.left = 'unset'
    }

    // Shift UI position based on the character position
    if(position.row < 7 && position.col < Math.floor(9/2)){
        actionMenu.style.left = (tileSize * 6) + 'px'
    }else{
        actionMenu.style.left = 'unset'
    }  
}

export const toggleActionMenuOption = (action, disable, mode = '') => {
    for(let i=0; i < actionMenuOptions.length; i++){
        if(actionMenuOptions[i].dataset.action === action){
            if(mode.length){
                if(mode === 'event'){
                    actionMenuOptions[i].style.display = (disable)? 'none' : 'block'
                }
            }else
            if(disable){
                actionMenuOptions[i].classList.add('no-event')
            }else{
                actionMenuOptions[i].classList.remove('no-event')
            }
            return
        }
    }
}

export const toggleActionMenuAndCharacterCaption = () => {
    if(!characterCaption.classList.contains('invisible')){
        characterCaption.classList.add('invisible') 
    }

    if(actionMenu.classList.contains('action_menu_open')){
        actionMenu.classList.remove('action_menu_open') 
    }
}

export const resetActionMenu = async(x, y) => {
    for(let i=0; i < actionMenuOptions.length; i++){
        actionMenuOptions[i].style.display = 'block'
    }

    const event = await game.checkIfStepOnTheEvent(x, y)

    if(event === undefined) actionMenuOptions[4].style.display = 'none'
}

export const alterActionMenu = () => {
    for(let i=0; i < actionMenuOptions.length; i++){
        if (actionMenuOptions[i].dataset.action !== 'status'){
            actionMenuOptions[i].style.display = 'none'
        }
    }
}

export const toggleOptionMenu = () => {
    if(option_menu.classList.contains('action_menu_open')){
        option_menu.classList.remove('action_menu_open')
    }else{
        option_menu.classList.add('action_menu_open')
    }
}

export const hideOptionMenu = () => {
    option_menu.classList.remove('action_menu_open')
}
  
// Get the position on the tileMap
export const getPosition = (event, tileSize) => {
    // console.log("tileSize :>>>", tileSize)
    let positionY = event.clientY - canvasPosition.top
    let positionX = event.clientX - canvasPosition.left

    let row = parseInt( positionY / tileSize)
    let col = parseInt( positionX / tileSize)

    return { row, col }
}

export const redefineDeviceWidth = () => {
    let deviceWidth = window.innerWidth
    let deviceHeight = window.innerHeight

    if(deviceHeight <= 768){
        deviceWidth = Math.floor(deviceHeight * aspectRatio)       
    }else

    if(deviceWidth <= 500){
        deviceHeight = Math.floor(deviceWidth * (16/9))
    }else{
        deviceWidth = Math.floor(deviceHeight * aspectRatio)
    }

    // Set up tile size according to the canvas width
    const tileSize = setting.general.tileSize = Math.floor(deviceWidth / 9);
    const cameraWidth = setting.general.camera.width = tileSize * 9 
    const cameraHeight = setting.general.camera.height = tileSize * 16 

    return { tileSize, cameraWidth, cameraHeight }
}

export const redefineFontSize = (cameraWidth) => {
    const fontSize = setting.general.fontSize = Math.floor( 8 * Math.floor(cameraWidth / 100))
    const fontSize_md = setting.general.fontSize_md = Math.floor(fontSize * 0.75)
    setting.inventory.itemBlockSize = Math.floor(cameraWidth / 100) * 30
    setting.inventory.itemBlockMargin = Math.floor((setting.inventory.itemBlockSize  / 100) * 10)

    const fontSize_sm = setting.general.fontSize_sm = Math.floor(fontSize * 0.5)

    return { fontSize, fontSize_md, fontSize_sm }
}

export const resize = () => {
    console.log('resize')

    const { tileSize, cameraWidth, cameraHeight } = redefineDeviceWidth()

    const { fontSize, fontSize_md, fontSize_sm } = redefineFontSize(cameraWidth)

    game?.tileMap?.changeTileSize(tileSize)
    game?.grid?.setTileSize(tileSize)
    game?.range?.setTileSize(tileSize)

    // Get the player position relative to the canvas size
    game.player.forEach((p, index) => {
        p.setCharacterTileSize(tileSize)
        p.setCharacterPosition(game.playerPosition[index].col * tileSize, game.playerPosition[index].row * tileSize) 
    })
 
    console.log('player :>>>', game.player)

    game.enemy.forEach((e, index) => {
        e.setCharacterTileSize(tileSize)
        e.setCharacterPosition(game.enemyPosition[index].col * tileSize, game.enemyPosition[index].row * tileSize)
    })

    console.log('enemy :>>>', game.enemy)

    game?.action?.setFontSize(Math.floor(fontSize * 2))

    // calculation the percentage of the attribute
    for(let i=0; i < gauges.length; i++){
        // console.log(gauges[i].firstElementChild)
        gauges[i].firstElementChild.style.height = fontSize_sm + 'px';
    }

    // action menu child font size
    for(let i=0; i < actionMenuOptions.length; i++){
        actionMenuOptions[i].style.fontSize = fontSize + 'px';
    }

    // option menu child font size
    for(let i=0; i < options.length; i++){
        options[i].style.fontSize = fontSize + 'px';
    }

    appWrapper.style.width = cameraWidth  + 'px';
    appWrapper.style.height = cameraHeight + 'px';
    
    characterCaption.style.width = Math.floor(50 * (cameraWidth / 100)) + 'px'
    characterName.style.fontSize = fontSize + 'px';
    characterLv.style.fontSize = fontSize_sm + 'px';
    characterAp.style.fontSize = fontSize_sm + 'px';

    // Set phase transition style
    phaseWrapper.style.width = cameraWidth + 'px'
    phaseWrapper.style.height = cameraHeight + 'px' 
    phaseElement.style.fontSize = fontSize + 'px';

    // Set back button style
    for(let i=0; i < backBtn.length; i++){
        backBtn[i].style.transform = `translateX(-${fontSize_sm}px)`
        backBtn[i].style.top = fontSize_sm + 'px'      
        backBtn[i].style.fontSize = fontSize_md + 'px'  
    }

    canvas.height = game?.tileMap?.map.length * tileSize;
    canvas.width = game?.tileMap?.map[0].length * tileSize;
    // Get canvas position after resize
    canvasPosition = canvas.getBoundingClientRect();

    console.log('canvas element :>>>', canvas)
    console.log('canvas position :>>>', canvasPosition)

    if(!characterCaption.classList.contains('invisible')) prepareCharacterCaption(game.inspectingCharacter)

    switch(game.action.mode){
        case 'item':
            // Set inventory style
            resizeHiddenElement(Inventory.style, cameraWidth, cameraHeight, fontSize_sm)
            resizeInventory(cameraWidth, fontSize, fontSize_sm)
        break;
        case 'status':
            // Set status window style
            resizeHiddenElement(statusWindow.style, cameraWidth, cameraHeight, fontSize_sm)
            avatar.style.width = Math.floor(cameraWidth * 0.3) + 'px';
            avatar.style.height = Math.floor(cameraWidth * 0.3) + 'px';
            action.resizeStatusWindow()
        break;
        case 'pick':
            // Set pick up window style
            resizeHiddenElement(pickUpWindow.style, cameraWidth, cameraHeight, fontSize_sm)
            resizePickUp(fontSize, cameraWidth)
        break;
        case 'skill':
            // Set skill window style
            resizeHiddenElement(skillWindow.style, cameraWidth, cameraHeight, fontSize_sm)
            action.resizeSkillWindow(fontSize, fontSize_md, fontSize_sm, tileSize)
        break;
    }

    switch(game.option.mode){
        case 'party':
            // Set party window style
            resizeHiddenElement(partyWindow.style, cameraWidth, cameraHeight, fontSize_sm)
            game.option.resizePartyWindow(setting)
        break;
        case 'objective':
            game.option.resizeObjectiveWindow(objectiveWindow, setting)
        break;
        case 'config':
            // Set config window style
            configWindow.style.fontSize = fontSize_md + 'px'
            resizeHiddenElement(configWindow.style, cameraWidth, cameraHeight, fontSize_sm)
        break;
    }
}