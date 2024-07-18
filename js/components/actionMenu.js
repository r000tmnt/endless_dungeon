import game from "../game"
import setting from "../utils/setting"
import { executeAction } from '../utils/ui'
import { t } from '../utils/i18n'

export default class ActionMenu extends HTMLElement {
    static observedAttributes = ["show"]

    constructor(){
        super()
        this.actions = null
    }

    connectedCallback(){
        this.render()
        this.setAttribute("id", "action-menu")
        this.className = "absolute action_menu_close"
    }

    attributeChangedCallback(name, oldValue, newValue){
        console.log(`Attribute ${name} has changed from ${oldValue} to ${newValue}.`);

        const show = newValue === 'true'

        if(show){
            this.resize()
            this.classList.add('action_menu_open')
        }else{
            this.classList.remove('action_menu_open')
        }
    }

    render(){
        const { fontSize_md } = setting.general
        this.innerHTML =  `
            <ul id="action_list">
                <li 
                    class="action" 
                    data-action="move"
                    style="font-size: ${fontSize_md}px">
                        ${t(`ui.action.move`)}
                    </li>
                <li 
                    class="action" 
                    data-action="attack"
                    style="font-size: ${fontSize_md}px">
                        ${t(`ui.action.attack`)}
                    </li>
                <li 
                    class="action" 
                    data-action="skill"
                    style="font-size: ${fontSize_md}px">
                        ${t(`ui.action.skill`)}
                    </li>
                <li 
                    class="action" 
                    data-action="item"
                    style="font-size: ${fontSize_md}px">
                        ${t(`ui.action.item`)}
                    </li>
                <li 
                    class="action hide" data-action="pick"
                    style="font-size: ${fontSize_md}px">
                        ${t(`ui.action.pick`)}
                    </li>
                <li 
                    class="action" 
                    data-action="status"
                    style="font-size: ${fontSize_md}px">
                        ${t(`ui.action.status`)}
                    </li>
                <li 
                    class="action" 
                    data-action="stay"
                    style="font-size: ${fontSize_md}px">
                        ${t(`ui.action.stay`)}
                    </li>
            </ul>
        `

        this.actions = this.querySelectorAll('li')

        this.actions.forEach(action => {
            game.actionSelectSound.bindTarget(action)
            action.addEventListener('click', () => executeAction(action.dataset.action))
        })
    }

    resize(fontSize){
        this.actions.forEach(action => {
            action.style.fontSize = fontSize + 'px'
        })
    }

    toggleOption(action, disable, mode=''){
        let option = this.querySelector(`[data-action="${action}"]`)
        
        if(option !== null){
            if(mode === 'event'){
                option.style.display = (disable)? 'none' : 'block'
            }else if(disable){
                option.classList.add('button_disable')
            }else{
                option.classList.remove('button_disable')
            }
        }
    }

    excludeOption(action){
        this.actions.forEach(o => {
            o.style.display = o.dataset.action === action? 'block' : 'none'
        })
    }

    changeLanguage(){
        this.actions.forEach(o => {
            o.innerText = t(`ui.action.${o.dataset.action}`)
        })
    }
}

customElements.define("action-menu", ActionMenu)