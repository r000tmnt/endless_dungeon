import game from "../game";
import level from "../dataBase/level";
import setting from "../utils/setting";
import { resize } from "../utils/ui";

export default class titleScreen extends HTMLElement {
    static observedAttributes = ["show", "width"]

    constructor(){
        super();
        this.tapInterval = null;
    }

    // called each time the element is added to the document. The specification recommends that, as far as possible, developers should implement custom element setup in this callback rather than the constructor.
    connectedCallback() {
        this.innerHTML = this.constructTitleScreen()

        resize()
        window.addEventListener('resize', resize, false);
    }

    // called when attributes are changed, added, removed, or replaced.
    attributeChangedCallback(name, oldValue, newValue) {
        console.log(
            `Attribute ${name} has changed from ${oldValue} to ${newValue}.`,
        );

        switch(name){
            case 'show':
                if(newValue){
                    this.classList.remove("invisible")
                    this.classList.add("open_window")
    
                    const tap = this.children[1]
    
                    // Display tap to start
                    this.tapInterval = setInterval(() => {
                        if(tap.classList.contains('fade_in')){
                            tap.classList.remove("fade_in")
                            tap.classList.add("fade_out")
                        }else{
                            tap.classList.remove("fade_out")
                            tap.classList.add("fade_in")
                        }
                    }, 1000);
                
                    setTimeout(() => {
                        this.addEventListener('click', () => {
                            if(this.classList.contains('open_window')){
                                clearInterval(this.tapInterval)
                                tap.classList.add("fade_out")
                                // document.getthisById("titleAction").classList.remove('invisible')
                
                                // Start game
                                this.classList.remove('open_window')
                                this.classList.add('invisible')
                                
                                setTimeout(async() => {
                                    await level.load('tutorial_1').then(() => {
                                        game.level = JSON.parse(JSON.stringify(level.getOne('tutorial_1')));
                                        setting.currentLevel = "tutorial_1"
                                        game.beginNextPhase()                          
                                    })
                                }, 500)            
                            }
                        })        
                    }, 1000)
                }else{
                    this.classList.remove("open_window")
                    this.classList.add("invisible")
                }
            break;
            case 'width':
                const { fontSize, fontSize_md, fontSize_sm } = setting.general
                const { width, height } = setting.general.camera

                this.style.width = width + 'px'
                this.style.height = height + 'px'
                this.children[1].style.fontSize = fontSize_md + 'px'
                this.children[0].style.fontSize = fontSize + 'px'
                this.children[3].style.fontSize = fontSize_sm + 'px'
            break;
        }
    }

    constructTitleScreen() {
        return `
                <p class="title relative">
                    Endless Dungeon (for now...)
                </p>

                <div class="tap text-center relative">
                    TAP TO START
                </div>      
                
                <ul id="titleAction" class="invisible relative w-full">
                    <li data-action="start">Start</li>
                    <li data-action="load">Load</li>
                    <li data-action="exit">Exit</li>
                </ul>

                <small id="version" class="absolute"><!-- Version x.x.x -->
                    Version: ${__APP_VERSION__}
                </small>
        `
    }
}

customElements.define("title-screen", titleScreen)