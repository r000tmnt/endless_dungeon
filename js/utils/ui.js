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
const titleScreen = document.getElementById("titleScreen");
// const titleAction = document.getElementById("titleAction").querySelectorAll('li');
const version = document.getElementById('version')

// Loading screen UI
const loadingScreen = document.getElementById("Loading");

// Phase tranisition UI
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
const configOption = document.getElementById('config_option')

// Objective UI
const objectiveWindow = document.getElementById('objective')

// UI after Battle finished
const levelClear = document.getElementById('levelClear')
const resultAction = document.getElementById('resultAction')
const resultActionOptions = resultAction.querySelectorAll('li')
const warn = document.getElementById('warn')

// Display app version
version.innerHTML = `Version: ${__APP_VERSION__}`

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
            for(let i=0; i < options.length; i++){
                options[i].innerText = t(`ui.option.${options[i].dataset.option}`)
            }
        
            // Back button inner text
            for(let i=0; i < backBtn.length; i++){
                backBtn[i].innerText = t('back')
            }
        
            // action menu child inner text
            for(let i=0; i < actionMenuOptions.length; i++){
                actionMenuOptions[i].innerText = t(`ui.action.${actionMenuOptions[i].dataset.action}`)
            }
        
            // Result action child inner text
            for(let i=0; i < resultActionOptions.length; i++){
                resultActionOptions[i].innerText = t(`ui.result.${resultActionOptions[i].dataset.action}`)
            }
        
            // Button to finish the result screen
            const finishBtn = levelClear.getElementsByTagName('button')
        
            finishBtn[0].innerText = t('ui.inventory.range.cancel')
        
            finishBtn[1].innerText = t('ui.inventory.range.confirm')
        
            // config options
            const tableRows = Array.from(configOption.querySelectorAll('tr'))

            tableRows[0].children[0].innerText = t('ui.config.bgm')
            tableRows[1].children[0].innerText = t('ui.config.se')
            tableRows[2].children[0].innerText = t('ui.config.grid')
            tableRows[3].children[0].innerText = t('ui.config.filter')
            tableRows[4].children[0].innerText = t('ui.config.language')

            const gridLabel = tableRows[2].children[1].querySelectorAll('label')
            const filterLabel = tableRows[3].children[1].querySelectorAll('label')
            const languageInput = tableRows[4].children[1].querySelectorAll('input')

            gridLabel[0].innerText = t('ui.config.on')
            gridLabel[1].innerText = t('ui.config.off')
            filterLabel[0].innerText = t('ui.config.default')
            filterLabel[1].innerText = t('ui.config.retro')

            languageInput.forEach(l => {
                l.checked = l.value === i18n.language
            })
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
    // option menu child click event
    for(let i=0; i < options.length; i++){
        const action = options[i].dataset.option
        switch(action){
            case 'party':
                game.actionSelectSound.bindTarget(options[i])
                options[i].addEventListener('click', () => {
                    game.option.mode = action
                    game.option.setPartyWindow(game.player, setting, game.action)
                    partyWindow.classList.remove('invisible')
                    partyWindow.classList.add('open_window')
                })
            break;
            case 'objective':
                game.actionSelectSound.bindTarget(options[i])
                options[i].addEventListener('click', () => {
                    game.option.mode = action
                    game.option.setObjectiveWindow(objectiveWindow, setting, game.tileMap.objective)
                })
            break;
            case 'config':
                game.actionSelectSound.bindTarget(options[i])
                options[i].addEventListener('click', () => {
                    game.option.mode = action
                    game.option.setConfigWindow(setting)
                    configWindow.classList.remove('invisible')
                    configWindow.classList.add('open_window')
                })
            break;
            case 'end':
                game.actionSelectSound.bindTarget(options[i])
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
            case 'party':
                game.actionCancelSound.bindTarget(backBtn[i])
                backBtn[i].addEventListener('click', () => {
                    partyWindow.classList.add('invisible')
                    partyWindow.classList.remove('open_window')
                    game.option.mode = ''
                    game.option.cleatPartyWindow(partyWindow.style)
                })
            break;
            case 'objective':
                game.actionCancelSound.bindTarget(backBtn[i])
                backBtn[i].addEventListener('click', () => {
                    game.option.mode = ''
                    objectiveWindow.classList.add('invisible')
                    objectiveWindow.classList.remove('open_window')
                })
            break;
            case 'config':
                game.actionCancelSound.bindTarget(backBtn[i])
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
        const action = actionMenuOptions[i].dataset.action
        switch(action){
            case 'move':
                game.actionSelectSound.bindTarget(actionMenuOptions[i])
                actionMenuOptions[i].addEventListener('click', async() => {
                    game.action.mode = action
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
                game.actionSelectSound.bindTarget(actionMenuOptions[i])
                actionMenuOptions[i].addEventListener('click', async() => {
                    game.action.mode = action
                    hideUIElement() 
                    const { tileSize } = setting.general
                    const position = game.playerPosition.find(p => p.row === parseInt(game.inspectingCharacter.y / tileSize) && p.col === parseInt(game.inspectingCharacter.x / tileSize))
                    await game.action.setAttack(game.tileMap, game.inspectingCharacter, position, 1)
                })
            break;   
            case "skill":
                game.actionSelectSound.bindTarget(actionMenuOptions[i])
                actionMenuOptions[i].addEventListener('click', () => {
                    game.action.mode = action
                    hideUIElement()
                    const { tileSize, fontSize, fontSize_md, fontSize_sm, camera } = setting.general
                    const { width, height } = camera
                    resizeHiddenElement(skillWindow.style, width, height, fontSize_sm)
                    const position = game.playerPosition.find(p => p.row === parseInt(game.inspectingCharacter.y / tileSize) && p.col === parseInt(game.inspectingCharacter.x / tileSize))
                    game.action.setSKillWindow(game.inspectingCharacter, game.tileMap, position, fontSize, fontSize_md, fontSize_sm)
                })
            break;
            case 'item':
                game.actionSelectSound.bindTarget(actionMenuOptions[i])
                actionMenuOptions[i].addEventListener('click', () => {
                    game.action.mode = action
                    prepareInventory(game.inspectingCharacter)
                })
            break; 
            case 'pick':
                game.actionSelectSound.bindTarget(actionMenuOptions[i])
                actionMenuOptions[i].addEventListener('click', () => {
                    game.action.mode = action
                    preparePickUpWindow()
                })
            break;
            case 'status':
                game.actionSelectSound.bindTarget(actionMenuOptions[i])
                actionMenuOptions[i].addEventListener('click', () => {
                    game.action.mode = action
                    hideUIElement()
                    const { fontSize, fontSize_md, fontSize_sm, camera } = setting.general
                    const { width, height } = camera
                    resizeHiddenElement(statusWindow.style, width, height, fontSize_sm)
                    game.action.setStatusWindow(game.inspectingCharacter, fontSize, fontSize_md, fontSize_sm, width)
                })
            break;
            case 'stay':
                game.actionSelectSound.bindTarget(actionMenuOptions[i])
                actionMenuOptions[i].addEventListener('click', async() => {
                    hideUIElement()
                    setTimeout(() => {
                        game.inspectingCharacter.attributes.ap = 0
                        game.characterAnimationPhaseEnded(game.inspectingCharacter)
                    }, 500)
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
                    if(game.stepOnEvent.item.length){
                        // game.stash = JSON.parse(JSON.stringify(game.stepOnEvent.item))
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
                    if(game.stepOnEvent.item.length){
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
                    if(game.stepOnEvent.item.length){
                        const { fontSize_md, camera } = setting.general
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
            displayTitleScreen()
        })
    })
}

// Display title screen
export const displayTitleScreen = () => {
    titleScreen.classList.remove('invisible')
    titleScreen.classList.add('open_window')

    const tap = titleScreen.children[1]

    // Display tap to start
    const tapInterval = setInterval(() => {
        if(tap.classList.contains('fade_in')){
            tap.classList.remove("fade_in")
            tap.classList.add("fade_out")
        }else{
            tap.classList.remove("fade_out")
            tap.classList.add("fade_in")
        }
    }, 1000);

    setTimeout(() => {
        titleScreen.addEventListener('click', () => {
            if(titleScreen.classList.contains('open_window')){
                clearInterval(tapInterval)
                tap.classList.add("fade_out")
                // document.getElementById("titleAction").classList.remove('invisible')

                // Start game
                titleScreen.classList.remove('open_window')
                titleScreen.classList.add('invisible')
                
                setTimeout(async() => {
                    await level.load('p-1-1').then(() => {
                        game.level = JSON.parse(JSON.stringify(level.getOne('p-1-1')));
                        setting.currentLevel = "p-1-1"
                        game.beginNextPhase()                          
                    })
                }, 500)            
            }
        })        
    }, 1000)
}

// Display the battle result screen
export const displayResult = (win) => {
    const { width, height } = setting.general.camera
    const { fontSize, fontSize_md, fontSize_sm } = setting.general

    resizeHiddenElement(levelClear.style, width, height, fontSize_md)
    const title = levelClear.children[0]
    title.style.fontSize = (fontSize * 2) + 'px'

    if(win){
        title.innerText = "Victory"
        title.style.color = 'gold'

        document.documentElement.style.setProperty('--fontSize', fontSize_md + 'px')

        const optional = levelClear.querySelector('#optional')
        optional.classList.remove('invisible')

        if(game.tileMap.objective.optional.length){
            game.tileMap.objective.optional.map(o => {
                const condition = document.createElement('li')
                if(o.target === 'turn'){
                    condition.innerText = `Finish the level in ${o.value} turns\n`
                    condition.style.margin = `${fontSize_sm}px 0`

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
            resultAction.classList.remove('invisible')
        }, 1000)
    }else{
        title.innerText = 'Game Over'
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

    levelClear.classList.remove('invisible')
    levelClear.classList.add('open_window')
}

export const preparePickUpWindow = () => {
    hideUIElement()
    const { fontSize, fontSize_sm, camera } = setting.general
    const { width, height } = camera
    const { itemBlockSize, itemBlockMargin } = setting.inventory
    resizeHiddenElement(pickUpWindow.style, width, height, fontSize_sm)
    constructPickUpWindow(game.inspectingCharacter, width, game.stepOnEvent.item, game.tileMap, fontSize, fontSize_sm, itemBlockSize, itemBlockMargin)
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

export const toggleTurnElement = (display) => 
{
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

    game.action.mode = ''  
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

    const position = (inspectingCharacter.type === 2)? game.playerPosition[game.player.findIndex(p => p.id === inspectingCharacter.id)] : game.enemyPosition[game.enemy.findIndex(e => e.id === inspectingCharacter.id)]

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
                actionMenuOptions[i].classList.add('button_disable')
            }else{
                actionMenuOptions[i].classList.remove('button_disable')
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
            options[i].style.fontSize = fontSize_md + 'px';
        }       
        
        characterCaption.style.width = Math.floor(50 * (width / 100)) + 'px'
        characterName.style.fontSize = fontSize + 'px';
        characterLv.style.fontSize = fontSize_sm + 'px';
        characterAp.style.fontSize = fontSize_sm + 'px';
    
        // Set warning window style
        warn.style.width = (width - (fontSize_md * 2)) + 'px'
        warn.style.padding = fontSize_md + 'px'
        warn.style.fontSize = fontSize_md + 'px'

        Array.from(levelClear.getElementsByTagName('button')).forEach(fb => fb.style.fontSize = fontSize_sm + 'px')
    
        // Set back button style
        for(let i=0; i < backBtn.length; i++){
            backBtn[i].style.transform = `translateX(-${fontSize_sm}px)`
            backBtn[i].style.top = fontSize_sm + 'px'      
            backBtn[i].style.fontSize = fontSize_md + 'px'  
        }
}

export const resize = () => {
    console.log('resize')

    const { tileSize, cameraWidth, cameraHeight } = redefineDeviceWidth()

    const { fontSize, fontSize_md, fontSize_sm } = redefineFontSize(cameraWidth)

    appWrapper.style.width = cameraWidth  + 'px';
    appWrapper.style.height = cameraHeight + 'px';

    titleScreen.style.width = cameraWidth  + 'px';
    titleScreen.style.height = cameraHeight + 'px';
    titleScreen.children[0].style.fontSize = fontSize + 'px';

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
                if(!characterCaption.classList.contains('invisible')) prepareCharacterCaption(game.inspectingCharacter)

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
                        configOption.style.width = (cameraWidth - (fontSize_md * 2)) + 'px'
                        configWindow.children[0].style.fontSize = fontSize + 'px'
                        resizeHiddenElement(configWindow.style, cameraWidth, cameraHeight, fontSize_sm)
                    break;
                }
            break;
        }
    }
}