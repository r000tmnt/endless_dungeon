import setting from "./utils/setting"

export default class Audio{
    /**
     * Create a new Audio object
     * @param {string} source - The path of the audio file 
     * @param {string} type - The types of the audio file
     * @param {object} target - The element to trigger the sound effect  
     * @returns 
     */
    constructor(source, type, target = null){
        this.element = document.createElement('audio')
        this.element.src = source
        this.element.muted = true

        // this.ctx = new AudioContext()
        // this.audio = null
        // this.playSound = null

        // Get audio source and decode it as an audio node
        // fetch(source)
        // .then(data => data.arrayBuffer())
        // .then(arrayBuffer => this.ctx.decodeAudioData(arrayBuffer))
        // .then(decodeAudioData => {
        //     this.audio = decodeAudioData

        //     this.playSound = this.ctx.createBufferSource()
        //     this.playSound.buffer = this.audio
        //     this.playSound.connect(this.ctx.destination)

            // Asign different types of click event for different types of audio
            switch(type){
                case 'bg':
                    // this.playSound.loop = true
                    // this.play()
                    this.element.volume = setting.general.bgm / 100
                    this.element.muted = false
                    this.element.loop = true
                    this.element.play()   
                break;
                case 'interface': case 'step': case 'attack': case 'item': case 'status':
                    this.element.volume = setting.general.se / 100
                break;
                default:
                    this.element.volume = setting.general.bgm / 100
                    this.bindTarget(target)
                break;
            }
        // })

        // this.canPlayThroughEvent = () => {
        //     if(this.element.readyState > 3){
        //         console.log('canplaythrough')
        //         this.element.muted = false
        //         this.element.loop = true
        //         this.element.play()                
        //     }
        // }
    }

    // play(){
    //     this.playSound.start(this.ctx.currentTime)
    // }

    /**
     * Remove the event listener on the audio element
     * @param {string} eventType - The type of the event 
     */
    // cancelEvent(eventType){
    //     this.element.removeEventListener(eventType, this.canPlayThroughEvent)
    // }

    bindTarget(target){
        target.addEventListener("click", () => {
            // this.play()
            this.element.muted = false
            this.element.play()
        });    
    }
}