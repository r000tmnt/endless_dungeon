import game from "../game"
import setting from "../utils/setting"
import { resizeHiddenElement } from "../utils/ui"
import { t } from "../utils/i18n.js"

export default class PartyMenu extends HTMLElement {
    static observedAttributes = ["member", "show", "resize"]

    constructor(){
        super()
        this.list = null
    }

    connectedCallback() {
        this.innerHTML = this.render()
        this.list = this.children[2]
    
        // Close button click event
        game.actionCancelSound.bindTarget(this.children[1])
        this.children[1].addEventListener('click', () => {
            this.setAttribute("show", false)
            game.option = ''
            this.setAttribute("member", JSON.stringify([]))
            resizeHiddenElement(this.style, 0, 0, 0)
        })
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if(name === "member"){
            const member = JSON.parse(newValue)

            if(member.length){
                const { fontSize, fontSize_md, fontSize_sm, camera } = setting.general
                const { width, height } = camera
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

                // member click event
                for(let i=0, list = Array.from(this.list.childNodes); i < list.length; i++){
                    list[i].addEventListener('click', () => {
                        console.log("party menu clicked")
                        // game.action.mode = 'status'
                        // resizeHiddenElement(document.getElementById('status').style, width, height, fontSize_sm)
                        // game.action.setStatusWindow(member[i], fontSize, fontSize_md, fontSize_sm, width)
                    })   
                }
            }else{
                this.list.innerHTML = ''
            }
        }

        if(name === "show"){
            const { fontSize, fontSize_md, camera } = setting.general
            const { itemBlockSize } = setting.inventory
            const { width, height } = camera

            const show = newValue === 'true'

            if(show){
                resizeHiddenElement(this.style, width, height, fontSize_md)

                this.children[0].innerText = t('ui.option.party')
                this.children[0].style.fontSize = fontSize + 'px'
                this.children[2].style.fontSize = fontSize_md + 'px'
                this.children[2].style.maxHeight = (itemBlockSize * 3) + 'px'
                this.classList.add("open_window")
                this.classList.remove("invisible")
            }else{
                this.classList.add("invisible")
                this.classList.remove("open_window")
            }
        }

        if(name === "resize"){
            if(newValue !== 'null'){
                const { fontSize, fontSize_md, camera } = setting.general
                const { width, height } = camera
                const { itemBlockSize } = setting.inventory
                resizeHiddenElement(this.style, width, height, fontSize_md)
                this.children[0].style.fontSize = fontSize + 'px'
                this.children[2].style.fontSize = fontSize_md + 'px'
                this.children[2].style.maxHeight = (itemBlockSize * 3) + 'px'
                this.setAttribute("member", JSON.stringify(game.player))
                this.setAttribute("resize", null)
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