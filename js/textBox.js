import game from './game'
import { resizeHiddenElement } from "./utils/ui";

// Conversation UI
const conversationWindow = document.getElementById('conversation')
const dialogueControl = document.getElementById('dialogue_control')
// textBox parent wrapper
const dialogue = document.getElementById('dialogue')
// textBox content
const content = dialogue.querySelector('#textContent')

export default class TextBox{
    constructor(event){
        this.event = event;
        this.log = [];
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
        dialogue.addEventListener('click', () => {
            if(this.animationInit){
                // Skip animation / show the whole dialogue
                this.animationInit = false
            }else{
                // Load dialogue
                this.#loadConversation(this.event[this.sceneCounter].dialogue[this.dialogueCounter].message)
            }
        })
    
        // First time load conversation
        setTimeout(() => {
            this.dialogueLength = this.event[this.sceneCounter].dialogue.length - 1
            this.messageLength = this.event[this.sceneCounter].dialogue[this.dialogueCounter].message.length - 1
            this.textLength = this.event[this.sceneCounter].dialogue[this.dialogueCounter].message[this.messageCounter].length - 1
            this.#loadConversation(this.event[this.sceneCounter].dialogue[this.dialogueCounter].message)
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
                    if(this.sceneCounter === this.event.length){
                        this.sceneCounter = 0
                        conversationWindow.style.opacity = 0
                        conversationWindow.classList.add('invisible')
                        conversationWindow.classList.remove('open_window')
    
                        // Remove the predefined event
                        game.level.event.splice(0, 1)
                        game.phaseCount += 1
                        game.beginNextPhase()
                    }else{
                        this.sceneCounter += 1
                        this.textLength = this.event[this.sceneCounter].dialogue[this.dialogueCounter].message[this.messageCounter].length - 1    
                        this.#displayConversation(this.event[this.sceneCounter].dialogue[this.dialogueCounter].message[this.messageCounter])            
                    }
                }else{
                    // Increase the dialogue counter by one
                    this.dialogueCounter += 1   
                    this.messageLength = this.event[this.sceneCounter].dialogue[this.dialogueCounter].message.length - 1
                    this.textLength = this.event[this.sceneCounter].dialogue[this.dialogueCounter].message[this.messageCounter].length - 1
                    this.#displayConversation(this.event[this.sceneCounter].dialogue[this.dialogueCounter].message[this.messageCounter])
                }
            }else{
                // Increate the message counter by one
                this.messageCounter += 1                   
                this.textLength = message[this.messageCounter].length - 1
                this.#displayConversation(message[this.messageCounter])
            }
        }else{
            this.#displayConversation(message[this.messageCounter])
        }
    }
    
    #displayConversation = (message, speed = 100) => {
        this.animationInit = true
    
        const dialogueAnimation = setInterval(() => {
            // If the user wants to skip the dialogue or the messag is fully displayed
            if(!this.animationInit){
                // Skipping animation
                // Display all the text in the message
                content.innerHTML = message
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
                    content.innerHTML += message[this.textCounter] 
                    this.textCounter += 1
                }  
            }
        }, speed)
    }
}