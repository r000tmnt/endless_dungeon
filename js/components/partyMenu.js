import game from "../game"
import setting from "../utils/setting"
import { resizeHiddenElement } from "../utils/ui"
import { t } from "../utils/i18n.js"

export default class PartyMenu extends HTMLElement {
    static observedAttributes = ["member", "show"]

    constructor(){
        super()
        this.list = null
    }

    connectedCallback() {
        this.innerHTML = this.render()
        this.list = this.children[2]
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if(name === "member"){
            const member = JSON.parse(newValue)

            if(member.length){
                const { itemBlockSize, itemBlockMargin } = setting.inventory
    
                this.list.innerHTML = `${
                    member.map(m => {
                            return `
                                <li 
                                    class="member flex bg-black"
                                    style="margin:${itemBlockMargin}px 0;padding:${itemBlockMargin}px">
                                    <img 
                                        src=""
                                        alt="icon"
                                        style="width:${itemBlockSize}px;height:${itemBlockSize}px"
                                    />
                                    <span>LV ${m.lv}</span>
                                    <span>${ m.name }</span>
                                </li>
                            `
                        })
                }`
            }
        }

        if(name === "show"){
            const {fontSize, fontSize_md, fontSize_sm, camera } = setting.general
            const { width, height } = camera

            const show = newValue === 'true'

            if(show){
                resizeHiddenElement(this.style, width, height, fontSize_md)

                this.children[0].innerText = t('ui.option.party')
                
                this.classList.add("open_window")
                this.classList.remove("invisible")
            }else{
                this.classList.add("invisible")
                this.classList.remove("open_window")
            }
        }
    }

    render(){
        return `
            <div>Party</div>

            <button class="back absolute" data-action="party" type="button">BACK</button>

            <ul id="member_list" class="disable-scrollbars bg-black"></ul>
        `
    }

    getPlayerStatus(){
        game.action.mode = 'status'
        // ...
    }
}

customElements.define("party-menu", PartyMenu)