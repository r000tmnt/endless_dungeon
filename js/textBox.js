import game from './game'
import setting from './utils/setting';
import { resizeHiddenElement } from "./utils/ui";

// Conversation UI
const conversationWindow = document.getElementById('conversation')
const dialogueControl = document.getElementById('dialogue_control')
// textBox parent wrapper
const dialogue = document.getElementById('dialogue')
// Dialogue options
const dialogueOptions = document.getElementById('dialogue-options')
// textBox content
const content = dialogue.querySelector('#textContent')

export default class TextBox{
    constructor(event){
        this.event = event;
        this.log = [];
        this.action = '';
        this.optionOnScreen = false;
        // Count the scence to display in conversation phase
        this.sceneCounter = 0;
        this.dialogueCounter = 0;
        this.textCounter = 0;
        this.messageCounter = 0;

        // Count the length of the event
        this.textLength = 0;
        this.messageLength = 0;
        this.dialogueLength = 0;
        this.animationInit = false;
    }

    setConversationWindow = (width, height, fontSize, fontSize_md, fontSize_sm) => {
    
        resizeHiddenElement(conversationWindow.style, width, height, fontSize_md)
    
        dialogueControl.style.transform = `translateX(${(width - dialogueControl.clientWidth) - (fontSize_md * 2)}px)`
        dialogueControl.style.fontSize = `${fontSize_sm}px`
    
        dialogue.style.fontSize = fontSize + 'px'
        dialogue.style.width = (width - (fontSize_md * 2)) + 'px'
        dialogue.style.height = Math.floor(height * 0.3) + 'px'
        dialogue.style.padding = fontSize_sm + 'px'
        dialogue.style.top = (Math.floor(height * 0.7) - (fontSize_md * 2)) + 'px' 
        dialogue.classList.remove('invisible')
    
        conversationWindow.classList.remove('invisible')
        conversationWindow.classList.add('open-window')
        conversationWindow.style.opacity = 1
    
        // Conversation text box click event
        conversationWindow.addEventListener('click', () => {
            if(this.optionOnScreen){
                return
            }

            if(this.animationInit){
                // Skip animation / show the whole dialogue
                this.animationInit = false
            }else{
                switch(this.action){
                    case 'hide':
                        this.action = ''
                        dialogue.style.opacity = 1
                        dialogue.classList.remove('invisible')
                        dialogueControl.style.opacity = 1
                        dialogueControl.classList.remove('invisible')
                    break;
                    case 'auto':
                    break;
                    case 'log':
                    break;
                    default:
                        // Load dialogue
                        this.#loadConversation(this.event[this.sceneCounter].dialogue[this.dialogueCounter].message)                        
                    break;
                }
            }
        })

        // Get dialog options
        const controlOptions = dialogueControl.querySelectorAll('li')

        // Bind click event to the options
        for(let i=0; i < controlOptions.length; i++){
            switch(controlOptions[i].dataset.action){
                case 'skip':
                    // Jump to the step where options are presents or to go the battle phase
                    controlOptions[i].addEventListener('click', (event) => {
                        event.stopPropagation()
                        this.action = 'skip'
                        let optionExist = false

                        for(let i=this.sceneCounter; i < this.event.length; i++){
                            if(optionExist) break
                            for(let j=this.dialogueCounter; j < this.event[i].dialogue.length; j++){
                                if(optionExist) break
                                for(let k=this.messageCounter; k < this.event[i].dialogue[j].message.length; k++){
                                    optionExist = this.#checkIfOptionExist(this.event[i].dialogue[j].message[k])

                                    // If option found
                                    if(optionExist){
                                        // Clear text in the box
                                        content.innerHTML = ''
                                        
                                        // Update counters
                                        this.textCounter = 0
                                        this.sceneCounter = i
                                        this.dialogueCounter = j
                                        this.messageCounter = k

                                        // Update length
                                        this.dialogueLength = this.event[this.sceneCounter].dialogue.length - 1
                                        const { message } = this.event[this.sceneCounter].dialogue[this.dialogueCounter]
                                        this.messageLength = message.length -1
                                        break
                                    }
                                }
                            }
                        }
                        
                        // Skip the whole conversation if there are no options found
                        if(!optionExist){
                            this.#endConversationPhase()
                        }
                    })
                break;
                case 'hide':
                    controlOptions[i].addEventListener('click', (event) => {
                        event.stopPropagation()

                        if(this.animationInit){
                            conversationWindow.click()
                        }
                        
                        this.action = 'hide'
                        dialogue.style.opacity = 0
                        dialogue.classList.add('invisible')
                        dialogueControl.style.opacity = 0
                        dialogueControl.classList.add('invisible')
                    })
                break;
                case 'auto':
                    // Increse the dialogue play speed and auto click, stop at options
                break;
                case 'log':
                break;
            }
        }
    
        // First time load conversation
        setTimeout(() => {
            const { dialogue } = this.event[this.sceneCounter]
            this.dialogueLength = dialogue.length - 1
            this.messageLength = dialogue[this.dialogueCounter].message.length - 1
            this.textLength = dialogue[this.dialogueCounter].message[this.messageCounter].content.length - 1
            this.#loadConversation(dialogue[this.dialogueCounter].message)
        }, 500)
    }

    #loadConversation = (message) => {
        // Load the next message if reached the end of current playing messge
        if(this.textCounter === this.textLength){
            // Reset text counter
            this.textCounter = 0
            // Clear the message on the screen
            content.innerHTML = ''    
            // Load thg next dialogue if reached the end of current playing dialougue           
            if(this.messageCounter === this.messageLength){
                // Reset the message counter
                this.messageCounter = 0 
    
                // Load the next scence if reached the end of the current playing scene
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
                    }
                }else{
                    // Increase the dialogue counter by one
                    this.dialogueCounter += 1 
                }

                const { message } = this.event[this.sceneCounter].dialogue[this.dialogueCounter]
                this.messageLength = message.length - 1
                
                if(this.action === 'skip'){
                    console.log('skipping conversation')
                    dialogueControl.children[0].click()
                }else{
                    const optionExist = this.#checkIfOptionExist(message[this.messageCounter])

                    if(!optionExist){
                        this.textLength = message[this.messageCounter].content.length - 1
                        this.#displayConversation(message[this.messageCounter])                     
                    }                     
                }

            }else{
                // Increate the message counter by one
                this.messageCounter += 1

                if(this.action === 'skip'){
                    console.log('skipping conversation')
                    dialogueControl.children[0].click()
                }else{
                    const optionExist = this.#checkIfOptionExist(message[this.messageCounter])

                    if(!optionExist){
                        this.textLength = message[this.messageCounter].content.length - 1
                        this.#displayConversation(message[this.messageCounter])                     
                    }                    
                }
            }
        }else{
            if(this.action === 'skip'){
                console.log('skipping conversation')
                dialogueControl.children[0].click()
            }else{
                const optionExist = this.#checkIfOptionExist(message[this.messageCounter])

                if(!optionExist) this.#displayConversation(message[this.messageCounter])                
            }
        }
    }

    #endConversationPhase(){
        conversationWindow.style.opacity = 0
        conversationWindow.classList.add('invisible')
        conversationWindow.classList.remove('open_window')

        // Remove the predefined event
        game.level.event.splice(0, 1)
        game.phaseCount += 1
        game.beginNextPhase()
    }
    
    #displayConversation = (message, speed = 100) => {
        this.animationInit = true

        const { style, size } = message

        if(style.length){
            content.style.color = style
        }

        if(size.length){
            content.style.fontSize = setting.general[size] + 'px'
        }
    
        const dialogueAnimation = setInterval(() => {
            // If the user wants to skip the dialogue or the messag is fully displayed
            if(!this.animationInit){
                // Skipping animation
                // Display all the text in the message
                content.innerHTML = message.content
                // Counter add up to the number of text in the message 
                this.textCounter = this.textLength
                // Stop animation
                clearInterval(dialogueAnimation)     
            }else{
                if(this.textCounter === this.textLength){
                    // Stop animation
                    this.animationInit = false
                    // Store the displayed message to the log
                    this.log.push(message)
                    clearInterval(dialogueAnimation)
                }else{
                    content.innerHTML += message.content[this.textCounter]
                    this.textCounter += 1
                }  
            }
        }, speed)
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
                option.style.background = 'none'
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
                    option.style.fontSize = setting.general.fontSize + 'px'
                }

                // Bind click event
                option.addEventListener('click', (event) => {
                    event.stopPropagation()
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
                        this.textCounter = this.textLength
                        this.#loadConversation(message)
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