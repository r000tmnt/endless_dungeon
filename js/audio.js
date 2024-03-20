export default class Audio{
    /**
     * 
     * @param {string} source - The path of the audio file 
     * @param {string} type - The types of the audio file
     * @param {object} target - The element to trigger the sound effect  
     * @returns 
     */
    constructor(source, type, target = null){
        this.element = document.createElement('audio')

        this.canPlayThroughEvent = () => {
            console.log('canplaythrough')
            this.element.muted = false
            this.element.loop = true
            this.element.play()
        }

        this.element.src = source
        this.element.muted = true
        
        // Asign different types of click event for different types of audio
        switch(type){
            case 'bg':
                this.element.addEventListener('canplaythrough', this.canPlayThroughEvent, { once: true })  
            break;
            case 'interface': case 'step': case 'attack':
                // if(target != null){                
                // }
            break;
            default:
                this.bindTarget(target)
            break;
        }
    }

    /**
     * Remove the event listener on the audio element
     * @param {string} eventType - The type of the event 
     */
    cancelEvent(eventType){
        this.element.removeEventListener(eventType, this.canPlayThroughEvent)
    }

    bindTarget(target){
        target.addEventListener("click", () => {
            this.element.muted = false
            this.element.play()
        });    
    }
}