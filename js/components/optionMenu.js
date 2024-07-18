import game from "../game"
import setting from "../utils/setting"
import { executeOption } from '../utils/ui'
import { t } from '../utils/i18n'

export default class OptionMenu extends HTMLElement {
    static observedAttributes = ["show"]

    constructor(){
        super()
        this.options = null
    }

    connectedCallback(){
        this.render()
        this.setAttribute("id", "option-menu")
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
            <ul id="option_list">
                <li 
                    class="action" 
                    data-option="party"
                    style="font-size: ${fontSize_md}px"
                >
                    ${t(`ui.option.party`)}
                </li>
                <li 
                    class="action" 
                    data-option="objective"
                    style="font-size: ${fontSize_md}px"    
                >
                    ${t(`ui.option.objective`)}
                </li>
                <li 
                    class="action" 
                    data-option="config"
                    style="font-size: ${fontSize_md}px">
                        ${t(`ui.option.config`)}
                    </li>
                <!-- <li class="action" data-option="save">Save</li> -->
                <li 
                    class="action" 
                    data-option="end"
                    style="font-size: ${fontSize_md}px">
                        ${t(`ui.option.end`)}
                </li>
            </ul>
        `

        this.options = this.querySelectorAll('li')

        this.options.forEach(option => {
            game.actionSelectSound.bindTarget(option)
            option.addEventListener('click', () => executeOption(option.dataset.option))
        })
    }

    resize(fontSize){
        this.options.forEach(option => {
            option.style.fontSize = fontSize + 'px'
        })
    }

    changeLanguage(){
        const options = this.querySelectorAll("li")

        options.forEach(o => {
            o.innerText = t(`ui.option.${o.dataset.option}`)
        })
    }
}

customElements.define("option-menu", OptionMenu)