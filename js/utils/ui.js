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
import level from '../dataBase/level.js';
import { changeLanguage, t, i18n} from './i18n.js'

// Get UI element and bind a click event
const aspectRatio = 9 / 16

// #region Canvas element
export let canvas = document.getElementById('game');

let canvasPosition

const appWrapper = document.getElementById('wrapper')
const turnCounter = document.getElementById('turn')
turnCounter.innerText = 'Turn 1'

// Title scrren UI
const titleScreen = document.getElementById("titleScreen")

// Loading screen UI
const loadingScreen = document.getElementById("Loading");

// Phase tranisition UI
const phaseWrapper = document.getElementById('Phase_Transition');
const phaseElement = document.getElementById('phase');

// Actiom menu UI
let actionMenu = null;

// Option menu UI
let optionMenu = null;

// Character caption UI
let characterCaption = null;

// Status UI
let statusMenu = document.getElementById('status')

const backBtn = document.getElementsByClassName('back')

// Inventory UI
const Inventory = document.getElementById('item')
const pickUpWindow = document.getElementById('pickUp')

// Skill UI
const skillWindow = document.getElementById('skill')

// Party UI
let partyMenu = null;

// Config UI
let configMenu = null;

// Objective UI
let objectiveMenu = null;

// UI after Battle finished
const levelClear = document.getElementById('levelClear')
const resultAction = document.getElementById('resultAction')
const resultActionOptions = resultAction.querySelectorAll('li')
const warn = document.getElementById('warn')


// Title screen action child click event
// for(let i=0; i < titleAction.length; i++){
//     switch(titleAction[i].dataset.action){
//         case 'start':
//             titleAction[i].addEventListener('click', (e) => {
//                 e.stopPropagation();

//                 titleScreen.classList.remove('open_window')
//                 titleScreen.classList.add('invisible')
                
//                 setTimeout(() => {
//                     game.level = JSON.parse(JSON.stringify(level.getOne('p-1-1')));
//                     game.beginNextPhase()                    
//                 }, 500)
//             })
//         break;
//         case 'load':
//             titleAction[i].addEventListener('click', (e) => {
//                 e.stopPropagation();
//             })
//         break;
//         case 'exit':
//             titleAction[i].addEventListener('click', (e) => {
//                 e.stopPropagation();
//             })
//         break;
//     }
// }


const endBattlePhase = () => {
    // Reset backgroud audio time line back to the start
    game.bgAudio.element.currentTime = 0
    // Stop background audio
    game.bgAudio.element.pause()
    toggleTurnElement(false)
    toggleCanvas(false)     
    countTurn(0) 
    canvas.removeEventListener('mousedown', game.canvasEvent)  
    levelClear.classList.remove('open_window')
    levelClear.classList.add('invisible')
    warn.classList.add('invisible')
    warn.classList.remove('open_window')
    game.action.mode = ''
    game.turnType = 0  
    game.beginNextPhase()   
}

export const reRenderUi = (game) => {
    const phase = game.level.phase[game.phaseCount]

    switch(phase){
        case 'conversation':
            const dialogueControl = document.getElementById('dialogue_control').querySelectorAll('li')
            
            for(let i=0; i < dialogueControl.length; i++){
                dialogueControl[i].innerText = t(`ui.conversation.${dialogueControl[i].dataset.action}`)
            }
        break;
        case 'battle':
            // option menu child inner text
            optionMenu.changeLanguage()
        
            // Back button inner text
            for(let i=0; i < backBtn.length; i++){
                backBtn[i].innerText = t('back')
            }
        
            // action menu child inner text
            actionMenu.changeLanguage()
        
            // Result action child inner text
            for(let i=0; i < resultActionOptions.length; i++){
                resultActionOptions[i].innerText = t(`ui.result.${resultActionOptions[i].dataset.action}`)
            }

            // inventory sub menu
            for(let i=0, itemActions = document.getElementById('itemAction').querySelectorAll('li'); i < itemActions.length; i++){
                itemActions[i].innerText = t(`ui.inventory.subMenu.${itemActions[i].dataset.action}`)
            }
        
            // Button to finish the result screen
            const finishBtn = levelClear.getElementsByTagName('button')
        
            finishBtn[0].innerText = t('ui.inventory.range.cancel')
        
            finishBtn[1].innerText = t('ui.inventory.range.confirm')

            configMenu.changeLanguage()
        break;
        case 'intermission':
        break;
    }
}

/**
 * Initialize ui elements
 * @param {object} game - The game object
 */
export const uiInit = (game) => {

    // Back button click event
    for(let i=0; i < backBtn.length; i++){
        switch(backBtn[i].dataset.action){
            case 'skill':
                game.actionCancelSound.bindTarget(backBtn[i])
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
                game.actionCancelSound.bindTarget(backBtn[i])
                backBtn[i].addEventListener('click', async() => {
                    game.action.mode = ''
                    // await checkIfStepOnTheEvent(game.inspectingCharacter.x, game.inspectingCharacter.y)
                    statusMenu.classList.add('invisible')
                    statusMenu.classList.remove('open_window')
                    game.action.resetStatusMenu(statusMenu.style)

                    if(game?.inspectingCharacter?.id){
                        prepareCharacterCaption(game.inspectingCharacter) 
                        displayUIElement()                    
                    }
                })
            break;
            case 'item':
                game.actionCancelSound.bindTarget(backBtn[i])
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
                game.actionCancelSound.bindTarget(backBtn[i])
                backBtn[i].addEventListener('click', async() => {
                    await closePickUpWindow()
                })
            break;
        }
    }

    // Result action child click event
    for(let i=0; i < resultActionOptions.length; i++){
        const action = resultActionOptions[i].dataset.action
        switch(action){
            case 'stash':
                game.actionSelectSound.bindTarget(resultActionOptions[i])
                resultActionOptions[i].addEventListener('click', () => {
                    if(game.eventsToTrigger[0].item.length){
                        // game.stash = JSON.parse(JSON.stringify(game.eventsToTrigger.item))
                        game.action.mode = action
                        preparePickUpWindow()

                        levelClear.classList.remove('open_window')
                        levelClear.classList.add('invisible')                        
                    }
                })
            break;
            case 'pickAfterBattle':
                // Choose which character to take items if there's more then one in the party
                game.actionSelectSound.bindTarget(resultActionOptions[i])
                resultActionOptions[i].addEventListener('click', () => {
                    if(game.eventsToTrigger[0].item.length){
                        game.action.mode = action
                        if(game.player.length > 1){
                            const partySubMenu = levelClear.querySelector('#partySubMenu')
            
                            const { itemBlockSize } = setting.inventory
            
                            game.player.map(p => {
                                const member = document.createElement('img')
                                member.style.width = itemBlockSize + 'px'
                                member.style.height = itemBlockSize + 'px'
                                member.src = p.characterImage
                                game.actionSelectSound.bindTarget(member)
                                member.addEventListener('click', () => {
                                    game.inspectingCharacter = p
                                    preparePickUpWindow()
                                    partySubMenu.classList.remove('open_window')
                                    partySubMenu.classList.add('invisible')
                                })

                                partySubMenu.append(member)
                            })

                            partySubMenu.classList.remove('invisible')
                            partySubMenu.classList.add('open_window')
                        }else{
                            game.inspectingCharacter = game.player[0]
                            preparePickUpWindow()
                        }

                        levelClear.classList.remove('open_window')
                        levelClear.classList.add('invisible')                        
                    }
                })
            break;
            case 'finish':
                game.actionSelectSound.bindTarget(resultActionOptions[i])
                resultActionOptions[i].addEventListener('click', () => {
                    if(game.eventsToTrigger[0].item.length){
                        const { fontSize_md, camera } = setting.general
                        warn.children[0].innerText = t("ui.result.warn")
                        warn.style.width = (camera.width - (fontSize_md * 2)) + 'px'
                        warn.style.padding = fontSize_md + 'px'
                        warn.classList.remove('invisible')
                        warn.classList.add('open_window')
                    }else{
                        const partySubMenu = levelClear.querySelector('#partySubMenu')

                        // Remove elements if any
                        while(partySubMenu.firstChild){
                            partySubMenu.removeChild(partySubMenu.firstChild)
                        }
                        
                        game.phaseCount += 1
                        game.beginNextPhase()      
                        toggleCanvas(false)          
                        levelClear.classList.remove('open_window')
                        levelClear.classList.add('invisible')                    
                    }
                })
            break;
        }
    }

    // Button to finish the result screen
    const finishBtn = levelClear.getElementsByTagName('button')

    game.actionCancelSound.bindTarget(finishBtn[0])
    finishBtn[0].addEventListener('click', () => {
        warn.classList.remove('open_window')
        warn.classList.add('invisible')
    })

    game.actionSelectSound.bindTarget(finishBtn[1])
    finishBtn[1].addEventListener('click', () => {
        game.phaseCount += 1 
        endBattlePhase()
    })
}

/**
 * Prepare to open inventory
 * @param {object} currentActingPlayer - The player this inventory belongs to 
 */
export const prepareInventory = async(currentActingPlayer) => {
    hideUIElement()
    const { fontSize, fontSize_sm, camera } = setting.general
    const { width, height } = camera
    const { itemBlockSize, itemBlockMargin } = setting.inventory
    resizeHiddenElement(Inventory.style, width, height, fontSize_sm)
    constructInventoryWindow(currentActingPlayer, game.enemyPosition, game.tileMap, fontSize, fontSize_sm, itemBlockSize, itemBlockMargin, width)
}

export const displayLanguageSelection = () => {
    const language = document.getElementById('language')
    language.classList.remove('invisible')

    const lngBtn = Array.from(language.querySelectorAll('button'))
    lngBtn.forEach(lb => {
        // lb.style.fontSize =  + 'px'
        lb.addEventListener('click', () => {
            localStorage.setItem('lng', lb.dataset.lng)
            changeLanguage(lb.dataset.lng)
            language.classList.add('invisible')
            setTimeout(() => {
                displayTitleScreen()
            }, 500);
        })
    })
}

// Display title screen
export const displayTitleScreen = () => {
    titleScreen.setAttribute("show", true)
}

// Display the battle result screen
export const displayResult = (win) => {
    const { width, height } = setting.general.camera
    const { fontSize, fontSize_md, fontSize_sm } = setting.general

    resizeHiddenElement(levelClear.style, width, height, fontSize_md)
    const title = levelClear.children[0]
    title.style.fontSize = (fontSize * 2) + 'px'

    if(win){
        title.innerText = t("ui.result.win")
        title.style.color = 'gold'

        document.documentElement.style.setProperty('--fontSize', fontSize_md + 'px')

        const optional = levelClear.querySelector('#optional')
        optional.setAttribute("data-title", t("ui.option.objective"))
        optional.classList.remove('invisible')

        if(game.tileMap.objective.optional.length){
            game.tileMap.objective.optional.map(o => {
                const condition = document.createElement('li')
                if(o.target === 'turn'){
                    condition.innerText = game.option.formObjectiveMessage(game.tileMap.objective, 'optional', i18n.language)
                    condition.style.margin = `${fontSize_sm}px 0`
                    condition.classList.add("bg-black")
                    condition.classList.add("flex")

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
            resultActionOptions.forEach(o => o.style.margin = `${fontSize_sm}px 0`)
            resultAction.setAttribute("data-title", t("ui.result.action"))
            resultAction.classList.remove('invisible')
        }, 1000)
    }else{
        title.innerText = t("ui.result.lose")
        title.style.color = 'grey'

        setTimeout(() => {
            levelClear.querySelector('.tap').classList.remove('invisible')

            levelClear.addEventListener('click', () => {
                // Back to title screen or intermission
                game.phaseCount = game.level.phase.length - 1
                endBattlePhase()
            })
        }, 1000)        
    }

    // Button to finish the result screen
    const finishBtn = levelClear.getElementsByTagName('button')
    
    finishBtn[0].innerText = t("ui.inventory.range.cancel")
    finishBtn[1].innerText = t("ui.inventory.range.confirm")

    levelClear.classList.remove('invisible')
    levelClear.classList.add('open_window')
}

export const preparePickUpWindow = () => {
    hideUIElement()
    const { fontSize, fontSize_sm, camera } = setting.general
    const { width, height } = camera
    const { itemBlockSize, itemBlockMargin } = setting.inventory
    resizeHiddenElement(pickUpWindow.style, width, height, fontSize_sm)
    constructPickUpWindow(game.inspectingCharacter, width, game.eventsToTrigger[0].item, game.tileMap, fontSize, fontSize_sm, itemBlockSize, itemBlockMargin)
}

export const closePickUpWindow = async() => {
    if(game.action.mode === 'pickAfterBattle' || game.action.mode === 'stash'){
        const partySubMenu = levelClear.querySelector('#partySubMenu')

        while(partySubMenu.firstChild){
            partySubMenu.removeChild(partySubMenu.firstChild)
        }

        pickUpWindow.classList.add('invisible')
        pickUpWindow.classList.remove('open_window')
        clearPickUpWindow(pickUpWindow.style)
        levelClear.classList.remove('invisible')
        levelClear.classList.add('open_window')
    }else{
        // Check if the tile has an event
        await game.checkIfStepOnTheEvent(game.inspectingCharacter.x, game.inspectingCharacter.y)
        pickUpWindow.classList.add('invisible')
        pickUpWindow.classList.remove('open_window')
        clearPickUpWindow(pickUpWindow.style)
        prepareCharacterCaption(game.inspectingCharacter)
        displayUIElement()                    
    }
    game.action.mode = ''
}

export const resizeHiddenElement = (target, width, height, size) => {
    target.padding = size + 'px'
    target.width = width + 'px'
    target.height = height + 'px'
}

export const toggleTurnElement = (display) => {
    if(display){
        turnCounter.classList.remove('invisible')
    }else{
        turnCounter.classList.add('invisible')
    }
}

export const countTurn = (turn) => {
    turnCounter.innerText = `Turn ${turn}` 
}

export const toggleLoadingScreen = (display) =>{
    if(display){
        loadingScreen.classList.remove('invisible')
    }else{
        loadingScreen.classList.add('invisible')
    }
}

export const toggleCanvas = (display) => {
    if(display){
        canvas.classList.remove('invisible')
    }else{
        canvas.classList.add('invisible')
    }
}

export const alterPhaseTransitionStyle = (bgColor) => {
    phaseWrapper.style.background = bgColor
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
    game.actionCancelSound.element.play()

    characterCaption.setAttribute("show", !characterCaption.classList.contains("invisible"))

    actionMenu.setAttribute("show", !actionMenu.classList.contains('action_menu_open'))

    game.action.mode = ''  
}

export const getLevelObjective = () => {
    objectiveMenu.renderObjective()
}

export const displayUIElement = () => {
    actionMenu.classList.add('action_menu_open')
    characterCaption.classList.remove('invisible') 
}

// Fill the element with a portion of the character info
export const prepareCharacterCaption = (inspectingCharacter) => {
    characterCaption.setAttribute("character", JSON.stringify(inspectingCharacter))
}

export const toggleActionMenuOption = (action, disable, mode = '') => {
    actionMenu.toggleOption(action, disable, mode)
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
    actionMenu.render()

    const event = await game.checkIfStepOnTheEvent(x, y)

    if(event === undefined) toggleActionMenuOption("pick", true, 'event')
}

export const alterActionMenu = () => {
    actionMenu.excludeOption("status")
}

export const toggleOptionMenu = () => {
    optionMenu.setAttribute("show", !optionMenu.className.includes("action_menu_open"))
}

export const hideOptionMenu = () => {
    optionMenu.classList.remove('action_menu_open')
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

    // Checking device screen in aspect ratio
    if((deviceWidth / deviceHeight) !== aspectRatio){
        if(deviceWidth <= 500){
            const possibileHeight = Math.floor(deviceWidth * (16 / 9))
            if(possibileHeight <= deviceHeight){
                deviceHeight = possibileHeight
            }
            
        }else{
            deviceWidth = Math.floor(deviceHeight * aspectRatio)
        }

        if(deviceHeight <= 768){
            deviceWidth = Math.floor(deviceHeight * aspectRatio)       
        }
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

export const setCanvasPosition = (tileSize) => {
    canvas.height = game.tileMap.map.length * tileSize;
    canvas.width = game.tileMap.map[0].length * tileSize;
    // Get canvas position after resize
    canvasPosition = canvas.getBoundingClientRect();
}

export const setBattlePhaseUIElement = (width, fontSize, fontSize_md, fontSize_sm) => {   
    // Set warning window style
    warn.style.width = (width - (fontSize_md * 2)) + 'px'
    warn.style.padding = fontSize_md + 'px'
    warn.style.fontSize = fontSize_md + 'px'

    Array.from(levelClear.getElementsByTagName('button')).forEach(fb => fb.style.fontSize = fontSize_sm + 'px')

}

export const appendCustomElements = async() => {
    const customElements = [
        document.createElement("action-menu"),
        document.createElement("character-caption"),
        document.createElement("config-menu"),
        document.createElement("objective-menu"),
        document.createElement("option-menu"),
        document.createElement("party-menu"),
        document.createElement("status-menu"),
        // And more...
    ]

    customElements.forEach(ce => {
        appWrapper.append(ce)
    })

    // Setup controller
    actionMenu = document.getElementById("action-menu")
    characterCaption = document.getElementById("character-caption")
    configMenu = document.getElementById("config-menu")
    objectiveMenu = document.getElementById("objective-menu")
    optionMenu = document.getElementById("option-menu")
    partyMenu = document.getElementById("party-menu")
    statusMenu = document.getElementById("status-menu")
}

// action menu child click event
export const executeAction = async(action) => {
    game.action.mode = action
    hideUIElement() 
    const { tileSize } = setting.general
    const position = {
        col: parseInt(game.inspectingCharacter.x / tileSize),
        row: parseInt(game.inspectingCharacter.y / tileSize),
    }

    switch(action){
        case 'move':
            const possibleEncounterEnemyPosition = game.limitPositonToCheck(game.inspectingCharacter.totalAttribute.moveSpeed, position, game.enemyPosition)
            await game.action.setMove(
                game.tileMap, 
                game.inspectingCharacter, 
                position, 
                game.inspectingCharacter.totalAttribute.moveSpeed, possibleEncounterEnemyPosition.length? possibleEncounterEnemyPosition : game.enemyPosition
            )
        break;
        case 'attack':
            await game.action.setAttack(game.tileMap, game.inspectingCharacter, position, 1)
        break;   
        case "skill":{
            const { fontSize, fontSize_md, fontSize_sm, camera } = setting.general
            const { width, height } = camera
            resizeHiddenElement(skillWindow.style, width, height, fontSize_sm)
            game.action.setSKillWindow(game.inspectingCharacter, game.tileMap, position, fontSize, fontSize_md, fontSize_sm)
        }
        break;
        case 'item':
            prepareInventory(game.inspectingCharacter)
        break; 
        case 'pick':
            preparePickUpWindow()
        break;
        case 'status':{
            const { fontSize, fontSize_md, fontSize_sm, camera } = setting.general
            const { width, height } = camera
            resizeHiddenElement(statusMenu.style, width, height, fontSize_sm)
            game.action.setStatusMenu(game.inspectingCharacter, fontSize, fontSize_md, fontSize_sm, width)
        }
        break;
        case 'stay':
            setTimeout(() => {
                game.inspectingCharacter.totalAttribute.ap = 0
                game.characterAnimationPhaseEnded(game.inspectingCharacter)
            }, 500)
        break;
    }
}

export const executeOption = (option) => {
    game.option = option
    switch(option){
        case 'party':
            partyMenu.setAttribute("show", true)
            partyMenu.setAttribute("member", JSON.stringify(game.player))
        break;
        case 'objective':
            objectiveMenu.setAttribute("show", true)
        break;
        case 'config':
            configMenu.setAttribute("show", true)
        break;
        case 'end':
            game.player.forEach(p => {
                p.totalAttribute.ap = 0
                p.wait = true
            })
            game.characterAnimationPhaseEnded(game.player[0])
            optionMenu.setAttribute("show", false)
        break;
    }
}

export const resize = () => {
    console.log('resize')

    const { tileSize, cameraWidth, cameraHeight } = redefineDeviceWidth()

    const { fontSize, fontSize_md, fontSize_sm } = redefineFontSize(cameraWidth)

    appWrapper.style.width = cameraWidth  + 'px';
    appWrapper.style.height = cameraHeight + 'px';

    titleScreen.resize()

    loadingScreen.style.width = cameraWidth + 'px'
    loadingScreen.style.height = cameraHeight + 'px'
    loadingScreen.style.fontSize = fontSize_md + 'px'

    // Set phase transition style
    phaseWrapper.style.width = cameraWidth + 'px'
    phaseWrapper.style.height = cameraHeight + 'px' 
    phaseElement.style.fontSize = fontSize + 'px';

    if(game.level !== null){
        switch(game.level.phase[game.phaseCount]){
            case 'conversation':
                game.textBox.resizeConversationWindow(cameraWidth, cameraHeight, fontSize, fontSize_md, fontSize_sm)
            break;
            case 'battle':
                actionMenu.resize(fontSize_md)
                characterCaption.resize(JSON.stringify(game.inspectingCharacter))
                optionMenu.resize(fontSize_md)

                setCanvasPosition(tileSize)

                setBattlePhaseUIElement(cameraWidth, fontSize, fontSize_md, fontSize_sm)

                game.tileMap.changeTileSize(tileSize)
                game.grid.setTileSize(tileSize)
                game.range.setTileSize(tileSize)

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

                game.action.setFontSize(Math.floor(fontSize * 2))

                warn.style.fontSize = fontSize_md + 'px'

                Array.from(levelClear.getElementsByTagName('button')).forEach(fb => fb.style.fontSize = fontSize_sm + 'px')

                switch(game.action.mode){
                    case 'item':
                        // Set inventory style
                        resizeHiddenElement(Inventory.style, cameraWidth, cameraHeight, fontSize_sm)
                        resizeInventory(cameraWidth, fontSize, fontSize_sm)
                    break;
                    case 'status':
                        // Set status window style
                        resizeHiddenElement(statusMenu.style, cameraWidth, cameraHeight, fontSize_sm)
                        statusMenu.resize()
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

                switch(game.option){
                    case 'party':
                        partyMenu.resize()
                    break;
                    case 'objective':
                        objectiveMenu.resize()
                    break;
                    case 'config':
                        configMenu.setAttribute("resize", true)
                    break;
                }
            break;
        }
    }
}