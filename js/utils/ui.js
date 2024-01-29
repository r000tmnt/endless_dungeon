import {
    constructInventoryWindow, 
    constructPickUpWindow,
    resizeInventory, 
    clearInventory, 
    resizePickUp, 
    clearPickUpWindow 
} from './inventory.js'

import setting from './setting.js';

import { 
    player, 
    playerPosition, 
    enemy, 
    enemyPosition, 
    inspectingCharacter,
    checkIfStepOnTheEvent,
    limitPositonToCheck,
    characterAnimationPhaseEnded,
    tileMap,
    grid,
    range,
    action,
    option
 } from '../game.js';

// Get UI element and bind a click event
const aspectRatio = 9 / 16

// #region Canvas element
export let canvas = document.getElementById('game');

let canvasPosition
let deviceWidth = window.innerWidth
let deviceHeight = window.innerHeight

const appWrapper = document.getElementById('wrapper')
const turnCounter = document.getElementById('turn')
turnCounter.innerText = 'Turn 1'

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

// option menu child click event
for(let i=0; i < options.length; i++){
    switch(options[i].dataset.option){
        case 'party':
            options[i].addEventListener('click', () => {
                option.mode = 'party'
                option.setPartyWindow(player, setting, action)
                partyWindow.classList.remove('invisible')
            })
        break;
        case 'config':
        break;
        case 'end':
            options[i].addEventListener('click', () => {
                player.forEach(p => {
                    p.attributes.ap = 0
                    p.wait = true
                })
                characterAnimationPhaseEnded(player[0])
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
                action.mode = ''
                await checkIfStepOnTheEvent(player.x, player.y)
                skillWindow.classList.add('invisible')
                skillWindow.classList.remove('open_window')
                action.clearSkillWindow()
                if(inspectingCharacter){
                    prepareCharacterCaption(inspectingCharacter) 
                 }
                displayUIElement()
            })
        break;
        case 'status':
            backBtn[i].addEventListener('click', async() => {
                action.mode = ''
                await checkIfStepOnTheEvent(player.x, player.y)
                statusWindow.classList.add('invisible')
                statusWindow.classList.remove('open_window')
                action.resetStatusWindow()
                if(inspectingCharacter){
                   prepareCharacterCaption(inspectingCharacter) 
                }
                displayUIElement()
            })
        break;
        case 'item':
            backBtn[i].addEventListener('click', async() => {
                action.mode = ''
                // Check if the tile has an event
                await checkIfStepOnTheEvent(player.x, player.y)
                Inventory.classList.add('invisible')
                Inventory.classList.remove('open_window')
                clearInventory()
                if(inspectingCharacter){
                   prepareCharacterCaption(inspectingCharacter) 
                }
                displayUIElement()
            })
        break;
        case 'pick':
            backBtn[i].addEventListener('click', async() => {
                action.mode = ''
                // Check if the tile has an event
                await checkIfStepOnTheEvent(player.x, player.y)
                pickUpWindow.classList.add('invisible')
                pickUpWindow.classList.remove('open_window')
                clearPickUpWindow()
                prepareCharacterCaption(inspectingCharacter)
                displayUIElement()
            })
        break;
        case 'party':
            backBtn[i].addEventListener('click', () => {
                partyWindow.classList.add('invisible')
                option.mode = ''
                option.cleatPartyWindow()
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
                const position = playerPosition.find(p => p.row === parseInt(inspectingCharacter.y / tileSize) && p.col === parseInt(inspectingCharacter.x / tileSize))
                const possibleEncounterEnemyPosition = limitPositonToCheck(inspectingCharacter.attributes.moveSpeed, position, enemyPosition)
                await action.setMove(
                    tileMap, 
                    inspectingCharacter, 
                    position, 
                    inspectingCharacter.attributes.moveSpeed, possibleEncounterEnemyPosition.length? possibleEncounterEnemyPosition : enemyPosition
                )           
            })
        break;
        case 'attack':
            actionMenuOptions[i].addEventListener('click', async() => {
                hideUIElement() 
                const { tileSize } = setting.general
                const position = playerPosition.find(p => p.row === parseInt(inspectingCharacter.y / tileSize) && p.col === parseInt(inspectingCharacter.x / tileSize))
                await action.setAttack(tileMap, inspectingCharacter, position, 1)
            })
        break;   
        case "skill":
            actionMenuOptions[i].addEventListener('click', () => {
                hideUIElement()
                const { tileSize } = setting.general
                const position = playerPosition.find(p => p.row === parseInt(inspectingCharacter.y / tileSize) && p.col === parseInt(inspectingCharacter.x / tileSize))
                action.setSKillWindow(inspectingCharacter, tileMap, position)
            })
        break;
        case 'item':
            actionMenuOptions[i].addEventListener('click', async() => {
                hideUIElement()
                action.mode = 'item'
                constructInventoryWindow(inspectingCharacter, enemyPosition, tileMap)
            })
        break; 
        case 'pick':
            actionMenuOptions[i].addEventListener('click', async() => {
                hideUIElement()
                const event = tileMap.getEventOnTile({x: inspectingCharacter.x, y: inspectingCharacter.y})
                action.mode = 'pick'
                const { width, height } = setting.general.camera
                constructPickUpWindow(inspectingCharacter, width, height, event.item, tileMap)
            })
        break;
        case 'status':
            actionMenuOptions[i].addEventListener('click', () => {
                hideUIElement()
                action.setStatusWindow(inspectingCharacter)
            })
        break;
        case 'stay':
            actionMenuOptions[i].addEventListener('click', async() => {
                hideUIElement()
                setTimeout(() => {
                    inspectingCharacter.attributes.ap -= 1
                    characterAnimationPhaseEnded(inspectingCharacter)
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

const resizeHiddenElement = (target, width, height, size) => {
    target.padding = size + 'px'
    target.width = width + 'px'
    target.height = height + 'px'
}

export const countTurn = (turn) => {
    turnCounter.innerText = `Turn ${turn}` 
}

export const togglePhaseTranistion = (turnType) => {
    phaseElement.innerText = (turnType === 0)? 'Enemy Phase' : 'Player Phase'
    // Phase transition fade in
    phaseWrapper.classList.add('fade_in')
    // Phase transition fade out
    setTimeout(() => {
        phaseWrapper.classList.add('fade_out')
    }, 1000)

    setTimeout(() => {
        phaseWrapper.classList.remove('fade_in')
        phaseWrapper.classList.remove('fade_out') 
    }, 1500);
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

    const position = (inspectingCharacter.characterType === 2)? playerPosition[player.findIndex(p => p.id === inspectingCharacter.id)] : enemyPosition[enemy.findIndex(e => e.id === inspectingCharacter.id)]

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

    const event = await checkIfStepOnTheEvent(x, y)

    if(event === undefined) actionMenuOptions[4].style.display = 'none'
}

export const alterActionMenu = () => {
    for(let i=0; i < actionMenuOptions.length; i++){
        if (actionMenuOptions[i].dataset.action !== 'status'){
            actionMenuOptions[i].style.display = 'none'
        }
    }
}

export const toggleOptionMenu = (tileSize) => {
    if(option_menu.classList.contains('action_menu_open')){
        option_menu.classList.remove('action_menu_open')
    }else{
        // Shift UI position based on the character position
        if(playerPosition.row < 7 && playerPosition.col < Math.floor(9/2)){
            option_menu.style.left = (tileSize * 6) + 'px'
        }else{
            option_menu.style.left = 'unset'
        }  
            
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

export const resize = () => {
    console.log('resize')

    deviceWidth = window.innerWidth
    deviceHeight = window.innerHeight

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
    tileMap.changeTileSize(tileSize)
    grid.setTileSize(tileSize)
    range.setTileSize(tileSize)

    const cameraWidth = setting.general.camera.width = tileSize * 9 
    const cameraHeight = setting.general.camera.height = tileSize * 16 

    // Get the player position relative to the canvas size
    player.forEach((p, index) => {
        p.setCharacterTileSize(tileSize)
        p.setCharacterPosition(playerPosition[index].col * tileSize, playerPosition[index].row * tileSize) 
    })
 
    console.log('player :>>>', player)

    enemy.forEach((e, index) => {
        e.setCharacterTileSize(tileSize)
        e.setCharacterPosition(enemyPosition[index].col * tileSize, enemyPosition[index].row * tileSize)
    })

    console.log('enemy :>>>', enemy)

    const fontSize = setting.general.fontSize = Math.floor( 8 * Math.floor(cameraWidth / 100))
    const fontSize_md = setting.general.fontSize_md = Math.floor(fontSize * 0.75)
    setting.inventory.itemBlockSize = Math.floor(cameraWidth / 100) * 30
    setting.inventory.itemBlockMargin = Math.floor((setting.inventory.itemBlockSize  / 100) * 10)

    const fontsize_sm = setting.general.fontSize_sm = Math.floor(fontSize * 0.5)

    action.setFontSize(Math.floor(fontSize * 2))

    // calculation the percentage of the attribute
    for(let i=0; i < gauges.length; i++){
        // console.log(gauges[i].firstElementChild)
        gauges[i].firstElementChild.style.height = fontsize_sm + 'px';
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
    characterLv.style.fontSize = fontsize_sm + 'px';
    characterAp.style.fontSize = fontsize_sm + 'px';

    // Set phase transition style
    phaseWrapper.style.width = cameraWidth + 'px'
    phaseWrapper.style.height = cameraHeight + 'px' 
    phaseElement.style.fontSize = fontSize + 'px';

    // Set status window style
    resizeHiddenElement(statusWindow.style, cameraWidth, cameraHeight, fontsize_sm)
    avatar.style.width = Math.floor(cameraWidth * 0.3) + 'px';
    avatar.style.height = Math.floor(cameraWidth * 0.3) + 'px';

    // Set skill window style
    resizeHiddenElement(skillWindow.style, cameraWidth, cameraHeight, fontsize_sm)

    // Set inventory style
    resizeHiddenElement(Inventory.style, cameraWidth, cameraHeight, fontsize_sm)

    // Set pick up window style
    resizeHiddenElement(pickUpWindow.style, cameraWidth, cameraHeight, fontsize_sm)

    // Set party window style
    resizeHiddenElement(partyWindow.style, cameraWidth, cameraHeight, fontsize_sm)

    for(let i=0; i < backBtn.length; i++){
        backBtn[i].style.transform = `translateX(-${fontsize_sm}px)`
        backBtn[i].style.top = fontsize_sm + 'px'        
    }

    canvas.height = tileMap.map.length * tileSize;
    canvas.width = tileMap.map[0].length * tileSize;
    // Get canvas position after resize
    canvasPosition = canvas.getBoundingClientRect();

    console.log('canvas element :>>>', canvas)
    console.log('canvas position :>>>', canvasPosition)

    if(!characterCaption.classList.contains('invisible')) prepareCharacterCaption(inspectingCharacter)

    switch(action.mode){
        case 'item':
            resizeInventory(cameraWidth, fontSize, fontsize_sm)
        break;
        case 'status':
            action.resizeStatusWindow()
        break;
        case 'pick':
            resizePickUp(fontSize, cameraWidth)
        break;
        case 'skill':
            action.resizeSkillWindow(fontSize, fontSize_md, fontsize_sm, cameraWidth, tileSize)
        break;
    }

    switch(option.mode){
        case 'party':
            option.resizePartyWindow(setting)
        break;
    }
}