import game from './game'
import setting from './utils/setting';
import { resizeHiddenElement } from "./utils/ui";
import Audio from './audio';

// Conversation UI
const conversationWindow = document.getElementById('conversation')
const dialogueControl = document.getElementById('dialogue_control')

// Character portrait wrapper
const character = document.getElementById('character')
const portrait = character.querySelectorAll('img')

// textBox
const textBox = document.getElementById('dialogue')
// Dialogue options
const dialogueOptions = document.getElementById('dialogue-options')

// Dialogue log
const dialogueLog = document.getElementById('dialogue-log')
const logWrapper = dialogueLog.querySelector('#log')

export default class TextBox{
    constructor(event){
        this.event = event;
        this.log = [];
        this.action = '';
        this.optionOnScreen = false;
        this.textBoxClicked = true

        // Count the scence to display in conversation phase
        this.sceneCounter = 0;
        this.dialogueCounter = 0;
        this.textCounter = 0;

        // Count the length of the event
        this.textLength = 0;
        this.dialogueLength = 0;
        this.animationInit = false;
        this.speed = 100; // normal
        this.delay = 3; // slow down
        this.optionSelected = 0;
        this.symbol = /[.。!,，「」\n\/"\?]/g
    }

    setConversationWindow = (width, height, fontSize, fontSize_md, fontSize_sm) => {
        this.resizeConversationWindow(width, height, fontSize, fontSize_md, fontSize_sm)
    
        setTimeout(() => {
            const { dialogue } = this.event[this.sceneCounter]

            // Define conunters
            this.dialogueLength = dialogue.length - 1
            this.textLength = dialogue[this.dialogueCounter].content.length - 1

            // Define background image
            conversationWindow.style.backgroundImage = `url(${__BASE_URL__}assets/images/bg/${this.event[this.sceneCounter].background}.png)`

            // Define background audio if needed
            if(this.event[this.sceneCounter].audio.length){
                if(game.bgAudio === null){
                    game.bgAudio = new Audio(`${__BASE_URL__}assets/audio/${this.event[this.sceneCounter].audio}.mp3`, 'bg')
                }else{
                    // Change audio source
                    game.bgAudio.element.src = `${__BASE_URL__}assets/audio/${this.event[this.sceneCounter].audio}.mp3`
                    game.bgAudio.element.play()
                }                
            }
            
            // Display conversation window
            conversationWindow.classList.remove('invisible')
            conversationWindow.classList.add('open_window')

            // Display text box
            setTimeout(() => {
                textBox.classList.remove('invisible')

                const { person } = dialogue[this.dialogueCounter]

                // Display character portrait if any
                if(person !== "none" && person.length){
                    portrait[0].src = `${__BASE_URL__}assets/images/portrait/${person}.png`
                    portrait[0].style.width = width + 'px'
                    portrait[0].style.height = height + 'px'

                    this.#loadCharacterPortrait(portrait[0], () => this.#loadConversation())
                }else{
                    console.log('first message')
                    // Load the first message of conversation
                    this.#loadConversation()
                    this.unLockTextBox()                   
                }
            }, 500)
        }, 500)
    }

    // Conversation click event
    setConversationEvent = (width, height, fontSize_md) => {
        game.clickSound.bindTarget(conversationWindow)
        conversationWindow.addEventListener('click', () => {
            
            if(this.optionOnScreen || this.action === 'auto' || this.textBoxClicked){
                console.log('Block')
                return
            }

            if(this.animationInit){
                console.log('skip the message')
                // Skip animation / show the whole dialogue
                this.animationInit = false
                this.textBoxClicked = true
            }else{
                console.log('conversation proceed')
                this.textBoxClicked = true
                switch(this.action){
                    case 'hide':
                        this.action = ''
                        dialogue.style.opacity = 1
                        dialogue.classList.remove('invisible')
                        dialogueControl.style.opacity = 1
                        dialogueControl.classList.remove('invisible')
                    break;
                    case 'auto':
                        // Cancel auto play
                        if(this.action === 'auto'){
                            this.action = '' 
                            this.speed = this.speed * 0.5
                        }
                    break;
                    default:
                        // Load dialogue
                        this.#loadConversation()                        
                    break;
                }
            }
            this.unLockTextBox() 
        })     
        
        // Get dialog options
        const controlOptions = dialogueControl.querySelectorAll('li')

        // Bind click event to the options
        for(let i=0; i < controlOptions.length; i++){
            const action = controlOptions[i].dataset.action
            switch(action){
                case 'skip':
                    game.clickSound.bindTarget(controlOptions[i])
                    // Jump to the step where options are presents or to go the battle phase
                    controlOptions[i].addEventListener('click', (event) => {
                        event.stopPropagation()
                        this.action = action
                        let optionExist = false

                        for(let i=this.sceneCounter; i < this.event.length; i++){
                            if(optionExist) break
                            for(let j=this.dialogueCounter; j < this.event[i].dialogue.length; j++){
                                if(optionExist) break
                                optionExist = this.#checkIfOptionExist(this.event[i].dialogue[j])

                                // If option found
                                if(optionExist){
                                    // Clear text in the box
                                    textBox.innerHTML = ''
                                    
                                    // Update counters
                                    this.textCounter = 0
                                    this.sceneCounter = i
                                    this.dialogueCounter = j

                                    // Update length
                                    this.dialogueLength = this.event[this.sceneCounter].dialogue.length - 1
                                    break
                                }

                                if(j === this.event[i].dialogue[j].length - 1){
                                    this.dialogueCounter = 0
                                }
                            }
                        }
                        
                        // Skip the whole conversation if there are no options found
                        if(!optionExist){
                            // Stop animation
                            clearInterval(this.dialogueAnimation)  
                            this.dialogueCounter = 0;
                            this.textCounter = 0;
                            this.sceneCounter = 0
                            this.action = ''
                            this.#endConversationPhase()
                        }
                    })
                break;
                case 'hide':
                    game.clickSound.bindTarget(controlOptions[i])
                    // Hide both text box and control options on the screen
                    controlOptions[i].addEventListener('click', (event) => {
                        event.stopPropagation()

                        if(this.animationInit){
                            conversationWindow.click()
                        }
                        
                        this.action = action
                        dialogue.style.opacity = 0
                        dialogue.classList.add('invisible')
                        dialogueControl.style.opacity = 0
                        dialogueControl.classList.add('invisible')
                    })
                break;
                case 'auto':
                    game.clickSound.bindTarget(controlOptions[i])
                    // Increse the dialogue play speed and auto click, stop at options
                    controlOptions[i].addEventListener('click', (event) => {
                        event.stopPropagation()

                        // Cancel auto play
                        if(this.action === action){
                            this.speed = 100
                            this.action = ''             
                        }else{
                            // Start auto play
                            this.speed = this.speed * 0.5
                            this.action = action
                        }

                        clearInterval(this.dialogueAnimation)

                        // In case if there are options to display when switching auto mode
                        if(this.event[this.sceneCounter].dialogue[this.dialogueCounter].option !== undefined){
                            this.#displayConversation(this.event[this.sceneCounter].dialogue[this.dialogueCounter].option[this.optionSelected])  
                        }else{
                            this.#displayConversation(this.event[this.sceneCounter].dialogue[this.dialogueCounter])  
                        }
                    })
                break;
                case 'log':
                    game.clickSound.bindTarget(controlOptions[i])
                    // Display dialogue log
                    controlOptions[i].addEventListener('click', (event) => {
                        event.stopPropagation()

                        this.action = action
                        
                        resizeHiddenElement(dialogueLog.style, width, height, fontSize_md)

                        this.log.map(l => {
                            const log = document.createElement('li')
                            const content = document.createElement('span')

                            if(l.person !== 'none'){
                                const person = document.createElement('span')
                                person.innerHTML = l.person
                                log.append(person)
                            }

                            content.innerHTML = l.content
                            log.style.margin = `${fontSize_md / 2}px 0`
                            log.style.padding = `${fontSize_md / 2}px`
                            log.append(content)
                            logWrapper.append(log)
                        })

                        // Bind clcik event to close log
                        dialogueLog.addEventListener('click', () => {
                            this.action = ''

                            dialogueLog.classList.remove('open_window')
                            dialogueLog.classList.add('invisible')

                            while(logWrapper.firstChild){
                                logWrapper.removeChild(logWrapper.firstChild)
                            }
                        })
                        
                        logWrapper.style.maxHeight = height + 'px'
                        dialogueLog.classList.remove('invisible')
                        dialogueLog.classList.add('open_window')
                    })
                break;
            }
        }
    }     
    
    unLockTextBox(){
        // Block click event for a few milliseconds
        setTimeout(() => {
            this.textBoxClicked = false
        }, 300)
    }

    resizeConversationWindow(width, height, fontSize, fontSize_md, fontSize_sm){
        resizeHiddenElement(conversationWindow.style, width, height, fontSize_md)
    
        dialogueControl.style.transform = `translateX(${(width - dialogueControl.clientWidth) - (fontSize_md * 2)}px)`
        dialogueControl.style.fontSize = `${fontSize_sm}px`
    
        dialogue.style.fontSize = fontSize + 'px'
        dialogue.style.width = (width - (fontSize_md * 2)) + 'px'
        dialogue.style.height = Math.floor(height * 0.3) + 'px'
        dialogue.style.padding = fontSize_sm + 'px'
        dialogue.style.top = (Math.floor(height * 0.7) - (fontSize_md * 2)) + 'px' 
    }

    #loadConversation = () => {
        // Load the next message if reached the end of current playing messge
        if(this.textCounter > this.textLength){
            // Reset text counter
            this.textCounter = 0
            // Clear the message on the screen
            textBox.innerHTML = ''    

            // Load the next scence if reached the end of the current one
            if(this.dialogueCounter === this.dialogueLength){
                this.dialogueCounter = 0

                // Stop the conversation phase if reached the end of the event
                if(this.sceneCounter === (this.event.length - 1)){
                    this.sceneCounter = 0
                    this.action = ''
                    this.#endConversationPhase()
                }else{
                    this.sceneCounter += 1  
                    this.dialogueLength = this.event[this.sceneCounter].dialogue.length - 1 
                    conversationWindow.style.backgroundImage = `url(${__BASE_URL__}assets/images/bg/${this.event[this.sceneCounter].background}.png)`     

                    this.#checkConversationPerson()
                }
            }else{
                // Increase the dialogue counter by one
                this.dialogueCounter += 1 

                this.#checkConversationPerson()                
            }
        }else{
            this.#checkConversationPerson()
        }
    }

    // Check if the portrait needs to change or not
    #checkConversationPerson = () => {
        const { person } = this.event[this.sceneCounter].dialogue[this.dialogueCounter]

        if(person === 'none'){
            // Hide portrait on the screen
            portrait.forEach(p => {
                if(!p.classList.contains('invisible')){
                    p.classList.add('invisible')
                }
            })

            this.#porceedToNextDialogue()
        }else
        if(person.length && this.event[this.sceneCounter].people > 0){
            const portraitShown = (3 - character.querySelectorAll('.invisible').length)

            // Display one more person on the scrren if the number says so
            if(portraitShown < this.event[this.sceneCounter].people){

                const { width, height } = setting.general.camera

                switch(portraitShown){
                    case 1: // Change order of portraits
                        portrait[0].style.order = 1
                        portrait[1].style.order = 0
                        portrait[1].style.width = width + 'px'
                        portrait[1].style.height = height + 'px'
                        portrait[1].src = `${__BASE_URL__}assets/images/portrait/${person}.png`

                        this.#loadCharacterPortrait(portrait[1], () => this.#porceedToNextDialogue())
                        character.style.justifyContent = 'space-evenly'                                        
                    break;
                    case 2: // Change order of portraits
                        portrait[0].style.order = 2
                        portrait[1].style.order = 1
                        portrait[2].style.order = 0
                        portrait[2].style.width = width + 'px'
                        portrait[2].style.height = height + 'px'
                        portrait[2].src = `${__BASE_URL__}assets/images/portrait/${person}.png`

                        this.#loadCharacterPortrait(portrait[2], () => this.#porceedToNextDialogue())
                        character.style.justifyContent = 'space-evenly'                                    
                    break;
                    default: // Place a portrait in the center of screen
                        portrait[0].style.width = width + 'px'
                        portrait[0].style.height = height + 'px'
                        portrait[0].src = `${__BASE_URL__}assets/images/portrait/${person}.png`

                        this.#loadCharacterPortrait(portrait[0], () => this.#porceedToNextDialogue())
                        character.style.justifyContent = 'unset' 
                    break;
                }
                console.log('show portrait')
            }else{
                // Replace the portrait with the other one
                portrait[0].src = `${__BASE_URL__}assets/images/portrait/${person}.png`

                this.#porceedToNextDialogue()
            }
        }else{
            this.#porceedToNextDialogue()
        }
    }

    // Get the next part of the conversation
    #porceedToNextDialogue = () => {
        const message = this.event[this.sceneCounter].dialogue[this.dialogueCounter]
            
        if(this.action === 'skip'){
            console.log('skipping conversation')
            dialogueControl.children[0].click()
        }else{
            const optionExist = this.#checkIfOptionExist(message)

            if(!optionExist){
                this.textLength = message.content.length - 1
                this.#displayConversation(message)                
            }                     
        }
    }

    #loadCharacterPortrait = (target, callBack) => {
        const portraitInterval = setInterval(() => {
            if(target.complete){
                target.classList.remove('invisible')
                clearInterval(portraitInterval)
                // Load the message of conversation
                callBack()  
            }
        }, 100)
    }

    #endConversationPhase(){
        conversationWindow.style.opacity = 0

        setTimeout(() => {
            // Reset backgroud audio time line back to the start
            game.bgAudio.element.currentTime = 0
            // Stop background audio
            game.bgAudio.element.pause()
            // Canacel event
            // game.bgAudio.cancelEvent('canplaythrough')

            // Remove the predefined event
            game.level.event.splice(0, 1)
            game.phaseCount += 1
            game.beginNextPhase()

            // Reset conversationWinsow style
            conversationWindow.classList.remove('open_window')
            conversationWindow.classList.add('invisible')
            conversationWindow.style.opacity = null
            dialogue.style.color = 'white'
            this.speed = 100

            // Clear text in the box
            textBox.innerHTML = ''
            // Clear conversation log
            this.log.splice(0)
            // Hide portraits
            portrait.forEach(p => p.classList.add('invisible'))
        }, 500)


    }
    
    #displayConversation = (message) => {
        console.log("message :>>> ", message)
        this.animationInit = true

        const { style, size, content } = message

        if(style.length){
            dialogue.style.color = style
        }

        if(size.length){
            dialogue.style.fontSize = setting.general[size] + 'px'
        }

        // const match = this.symbol.test(content[this.textCounter])
        const matches = [...content.matchAll(this.symbol)]
        const matchIndex = matches.map(t => t.index)
        console.log(matchIndex)
    
        this.dialogueAnimation = setInterval(() => {
            // If the user wants to skip the dialogue or the messag is fully displayed
            if(!this.animationInit){
                // Skipping animation
                // Display all the text in the message
                textBox.innerHTML = content
                // Counter add up to the number of text in the message 
                this.textCounter = this.textLength + 1
                // Store the displayed message to the log
                this.log.push({
                    person: this.event[this.sceneCounter].dialogue[this.dialogueCounter].person,
                    content: content
                })
                // Stop animation
                clearInterval(this.dialogueAnimation)     
            }else{
                if(this.textCounter > this.textLength){

                    // Store the displayed message to the log
                    this.log.push({
                        person: this.event[this.sceneCounter].dialogue[this.dialogueCounter].person,
                        content: content
                    })

                    if(this.action === 'auto'){
                        // Stop current timer
                        clearInterval(this.dialogueAnimation)
                        // Start a new timer
                        this.#loadConversation()
                    }else{
                        // Stop animation
                        this.animationInit = false
                        clearInterval(this.dialogueAnimation)
                    }
                }else{
                    
                    // console.log(match)

                    if(matchIndex.findIndex(i => i === this.textCounter) >= 0){
                        console.log(`character ${content[this.textCounter]} match`)
                        // this.delay += -1

                        textBox.innerHTML += content[this.textCounter]
                        dialogue.scrollTop = dialogue.scrollHeight // Scroll to buttom automatically
                        this.textCounter += 1  

                        // Stop current timer
                        clearInterval(this.dialogueAnimation)

                        setTimeout(() => {
                            // Start a new timer
                            this.#displayConversation(message)
                        }, this.speed * this.delay)

                    }else{
                        console.log(`character ${content[this.textCounter]} not match`)
                        // this.speed = 100
                        textBox.innerHTML += content[this.textCounter]
                        dialogue.scrollTop = dialogue.scrollHeight // Scroll to buttom automatically
                        this.textCounter += 1  
                    }
                }  
            }
        }, this.speed)
    }

    #checkIfOptionExist = (message) => {
        // Display option if any
        const optionExist = message.option !== undefined
        if(optionExist){
            this.optionOnScreen = true

            // Remove old options
            while(dialogueOptions.firstChild){
                dialogueOptions.removeChild(dialogueOptions.firstChild)
            }
            
            // Display option if any
            for(let i=0 ; i < message.option.length; i++){
                const option = document.createElement('li')
                option.innerHTML = message.option[i].value
                // option.style.background = 'none'
                option.style.margin = `${setting.general.fontSize_sm}px 0`

                const { style, size } = message.option[i]

                if(style.length){
                    option.style.color = style
                }else{
                    option.style.color = 'white'
                }

                if(size.length){
                    option.style.fontSize = setting.general[size] + 'px'
                }else{
                    option.style.fontSize = setting.general.fontSize_md + 'px'
                }

                // Bind click event
                game.clickSound.bindTarget(option)
                option.addEventListener('click', (event) => {
                    event.stopPropagation()
                    this.optionSelected = i
                    this.optionOnScreen = false
                    // Hide & clear option
                    dialogueControl.classList.remove('invisible')
                    dialogueControl.style.opacity = 1
                    dialogueOptions.classList.add('invisible')
                    dialogue.classList.remove('invisible')
                    dialogue.style.opacity = 1

                    this.textLength = message.option[i].content.length - 1
                    
                    for(let j=0; j < message.option[i].effect.length; j++){
                        game.eventEffect.push(message.option[i].effect[j])
                    }  

                    if(this.action === 'skip'){
                        this.textCounter = this.textLength + 1
                        this.#loadConversation()
                    }else{
                        this.#displayConversation(message.option[i])                      
                    }
                })

                dialogueOptions.append(option)
            }

            dialogueControl.style.opacity = 0
            dialogueControl.classList.add('invisible')
            dialogue.style.opacity = 0
            dialogue.classList.add('invisible')

            dialogueOptions.classList.remove('invisible')
        }

        return optionExist
    }
}