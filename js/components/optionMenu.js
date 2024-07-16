import game from "../game"
import setting from "../utils/setting"

export default class OptionMenu extends HTMLElement {
    static observedAttributes = ["show"]

    constructor(){
        super()
    }

    connectedCallback(){
        this.innerHTML = this.render()

        const options = this.querySelectorAll('li')

        options.forEach(option => {
            game.actionSelectSound.bindTarget(option)
            option.addEventListener('click', () => this.executeOption(option.dataset.option))
        })
    }

    attributeChangedCallback(name, oldValue, newValue){
        console.log(`Attribute ${name} has changed from ${oldValue} to ${newValue}.`);

        const show = newValue === 'true'

        if(show){
            this.classList.add('action_menu_open')
        }else{
            this.classList.remove('action_menu_open')
        }
    }

    render(){
        return `
            <ul id="option_list">
                <li class="action" data-option="party">Party</li>
                <li class="action" data-option="objective">Objective</li>
                <li class="action" data-option="config">Config</li>
                <!-- <li class="action" data-option="save">Save</li> -->
                <li class="action" data-option="end">End Turn</li>
            </ul>
        `
    }

    executeOption(action){
        game.option.mode = action
        switch(action){
            case 'party':
                game.option.setPartyWindow(game.player)
                // partyWindow.classList.remove('invisible')
                // partyWindow.classList.add('open_window')
            break;
            case 'objective':
                // options[i].addEventListener('click', () => {
                //     game.option.setObjectiveWindow(objectiveWindow, setting, game.tileMap.objective)
                // })
            break;
            case 'config':
                // game.option.setConfigWindow(setting)
                // configWindow.classList.remove('invisible')
                // configWindow.classList.add('open_window')
            break;
            case 'end':
                game.player.forEach(p => {
                    p.totalAttribute.ap = 0
                    p.wait = true
                })
                game.characterAnimationPhaseEnded(game.player[0])
                this.classList.remove('action_menu_open')
            break;
        }
    }
}

customElements.define("option-menu", OptionMenu)