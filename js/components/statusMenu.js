import setting from "../utils/setting"
import game from "../game"
import { t } from '../utils/i18n'

export default class StatusMenu extends HTMLElement {
    static observedAttributes = ["show"]

    constructor(){
        super()
        this.tableNode = null
        this.statusToggle = null
    }

    connectedCallback() {
        this.render()
        this.setAttribute("id", "status-menu")
        this.className = "menu absolute invisible border-box text-white bg-black"
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if(newValue === 'true'){
            this.classList.remove('invisible')
            this.classList.add('open_window')
        }else{
            this.classList.remove('open_window')
            this.classList.add('invisible')
        }
    }

    render(){
        const { fontSize, fontSize_md, fontSize_sm,camera } = setting.general
        const { width } = camera

        this.style.fontSize = fontSize + 'px'

        this.innerHTML = `
        <div class="status_header flex">
                <img 
                    id="avatar" 
                    src="" 
                    alt="avatar"
                    style="width:${Math.floor(width * 0.3)}px;height:${Math.floor(width * 0.3)}px">
                <div id="info" style="${fontSize_md}px">
                    <p>
                        ${game.inspectingCharacter.name}
                    </p>
                    <p>
                        ${t(`job.${game.inspectingCharacter.class_id}`)}
                    </p>
                </div>
            </div>

            <button class="back absolute" data-action="status" type="button">BACK</button>

            <div class="flex" style="justify-content: space-between">
                <p>Lv ${game.inspectingCharacter.lv}</p>
                <p data-attribute="pt">Pt ${game.inspectingCharacter.pt}</p>
            </div>
            
            <!-- Seperator -->
            <table 
                id="attributes" 
                class="w-fu>
                <tbody>
                    <tr>
                        <td>HP :</td>
                        <td class="status-node" data-attribute="hp">
                            ${game.inspectingCharacter.totalAttribute.hp}/${game.inspectingCharacter.totalAttribute.maxHp}
                        </td>
                        <td 
                            class="invisible flex attribute-toggle text-white" 
                            data-attribute="maxHp">
                            <span 
                                class="button_disable"
                                style="margin:0 ${fontSize_sm}px;padding:0 ${fontSize_sm / 2}px">-</span>
                            <span style="margin:0 ${fontSize_sm}px;padding:0 ${fontSize_sm / 2}px">+</span>
                        </td>
                    </tr>
                    <tr>
                        <td>MP :</td>
                        <td class="status-node" data-attribute="mp">
                             ${game.inspectingCharacter.totalAttribute.mp}/${game.inspectingCharacter.totalAttribute.maxMp}
                        </td>
                        <td 
                            class="invisible flex attribute-toggle text-white" 
                            data-attribute="maxMp">
                            <span 
                                class="button_disable"
                                style="margin:0 ${fontSize_sm}px;padding:0 ${fontSize_sm / 2}px">-</span>
                            <span style="margin:0 ${fontSize_sm}px;padding:0 ${fontSize_sm / 2}px">+</span>
                        </td>
                    </tr>
                    <tr>
                        <td>STR :</td>
                        <td class="status-node" data-attribute="str">
                          ${game.inspectingCharacter.totalAttribute.str}
                        </td>
                        <td c
                            lass="invisible flex attribute-toggle text-white" 
                            data-attribute="str">
                            <span 
                                class="button_disable"
                                style="margin:0 ${fontSize_sm}px;padding:0 ${fontSize_sm / 2}px">-</span>
                            <span style="margin:0 ${fontSize_sm}px;padding:0 ${fontSize_sm / 2}px">+</span>
                        </td>
                    </tr>   
                    <tr>
                        <td>DEF :</td>
                        <td class="status-node" data-attribute="def">
                            ${game.inspectingCharacter.totalAttribute.def}
                        </td>
                        <td 
                            class="invisible flex attribute-toggle text-white" 
                            data-attribute="def">
                            <span 
                                class="button_disable"
                                style="margin:0 ${fontSize_sm}px;padding:0 ${fontSize_sm / 2}px">-</span>
                            <span style="margin:0 ${fontSize_sm}px;padding:0 ${fontSize_sm / 2}px">+</span>
                        </td>                        
                    </tr>
                    <tr>
                        <td>INT :</td>
                        <td class="status-node" data-attribute="int">
                            ${game.inspectingCharacter.totalAttribute.int}
                        </td>                        
                        <td 
                            class="invisible flex attribute-toggle text-white" 
                            data-attribute="int">
                            <span 
                                class="button_disable"
                                style="margin:0 ${fontSize_sm}px;padding:0 ${fontSize_sm / 2}px">-</span>
                            <span style="margin:0 ${fontSize_sm}px;padding:0 ${fontSize_sm / 2}px">+</span>
                        </td> 
                    </tr>           
                    <tr>
                        <td>SPD :</td>
                        <td class="status-node" data-attribute="spd">
                          ${game.inspectingCharacter.totalAttribute.spd}
                        </td>      
                        <td 
                            class="invisible flex attribute-toggle text-white" 
                            data-attribute="spd">
                            <span 
                                class="button_disable"
                                style="margin:0 ${fontSize_sm}px;padding:0 ${fontSize_sm / 2}px">-</span>
                            <span style="margin:0 ${fontSize_sm}px;padding:0 ${fontSize_sm / 2}px">+</span>
                        </td>                   
                    </tr>
                    <tr>
                        <td>LUCK :</td>
                        <td class="status-node" data-attribute="lck">
                            ${game.inspectingCharacter.totalAttribute.lck}
                        </td>
                        <td 
                            class="invisible flex attribute-toggle text-white" 
                            data-attribute="lck">
                            <span 
                                class="button_disable"
                                style="margin:0 ${fontSize_sm}px;padding:0 ${fontSize_sm / 2}px">-</span>
                            <span style="margin:0 ${fontSize_sm}px;padding:0 ${fontSize_sm / 2}px">+</span>
                        </td>  
                    </tr>     
                    <tr>
                        <!-- Spirit as magic defense-->
                        <td>SPI :</td>
                        <td class="status-node" data-attribute="spi">
                            ${game.inspectingCharacter.totalAttribute.spi}
                        </td>
                        <td 
                            class="invisible flex attribute-toggle text-white" 
                            data-attribute="spi">
                            <span 
                                class="button_disable"
                                style="margin:0 ${fontSize_sm}px;padding:0 ${fontSize_sm / 2}px">-</span>
                            <span style="margin:0 ${fontSize_sm}px;padding:0 ${fontSize_sm / 2}px">+</span>
                        </td> 
                    </tr>       
                    <tr>
                        <td>AP :</td>
                        <td class="status-node" data-attribute="ap">
                            ${game.inspectingCharacter.totalAttribute.ap}/${game.inspectingCharacter.totalAttribute.maxAp}
                        </td>                        
                    </tr>        
                    <tr>
                        <!-- VIEW as sight -->
                        <td>VIEW :</td>
                        <td class="status-node"  data-attribute="sight">
                            ${game.inspectingCharacter.totalAttribute.sight}
                        </td>    
                    </tr>
                    <tr>
                        <td>MOVE :</td>
                        <td class="status-node"  data-attribute="moveSpeed">
                            ${game.inspectingCharacter.totalAttribute.moveSpeed}
                        </td>
                    </tr>
                    <tr>
                        <td>STAT :</td>
                        <td class="status-node"  data-attribute="status">
                            ${game.inspectingCharacter.status.length?
                            game.inspectingCharacter.status.map(s => `${s.name} `) : 'Healthy'}
                        </td>                        
                    </tr>                    
                    <tr>
                        <td>EXP :</td>
                        <td class="status-node" data-attribute="exp">
                            ${game.inspectingCharacter.exp? game.inspectingCharacter.exp : 0 } / ${game.inspectingCharacter.requiredExp? game.inspectingCharacter.requiredExp : 0}
                        </td>
                    </tr>                    
                </tbody>
            </table>
        `

        this.tableNode = this.children[3].querySelectorAll('.status-node')
        this.statusToggle = this.children[3].querySelectorAll('.attribute-toggle')

        // Status toggle click event
        for(let i=0; i < this.statusToggle.length; i++){
            this.statusToggle[i].children[0].addEventListener('click', () => {
                this.decreaseAttribute(this.statusToggle[i].dataset.attribute)
            })
            this.statusToggle[i].children[1].addEventListener('click', () => {
                this.increaseAttribute(this.statusToggle[i].dataset.attribute, i)
            })
        }
    }

    decreaseAttribute(attr){
        game.inspectingCharacter.totalAttribute[attr] -= 1
        game.inspectingCharacter.base_attribute[attr] -= 1
        game.inspectingCharacter.pt += 1
        this.children[2].children[0].innerText = `Pt ${game.inspectingCharacter.pt}`
        this.alterStatusList(game.inspectingCharacter, attr)

        // Disable minus button if the pt hits the max number
        if(game.inspectingCharacter.pt === 5){
            this.statusToggle.forEach(t => t.children[0].classList.add('button_disable'))
        }

        // Unlock plus button if there's atleast one point to spend
        if(game.inspectingCharacter.pt === 1){
            this.statusToggle.forEach(t => t.children[1].classList.remove('button_disable'))
        }
    }

    increaseAttribute(attr, index){
        game.inspectingCharacter.totalAttribute[attr] += 1
        game.inspectingCharacter.base_attribute[attr] += 1
        game.inspectingCharacter.pt -= 1
        this.children[2].children[0].innerText = `Pt ${game.inspectingCharacter.pt}`
        this.alterStatusList(game.inspectingCharacter, attr)

        // Unlock the minus button on the row
        this.statusToggle[index].children[0].classList.remove("button_disable")

        if(game.inspectingCharacter.pt === 0){
            this.statusToggle.forEach(t => t.children[1].classList.add('button_disable'))
        }
    }

    /**
     * Alter status number on the screen
     * @param {object} inspectingCharacter - An object represend current acting player
     * @param {number} attribute - A number of the stat to change
     */
    alterStatusList(inspectingCharacter, attribute){
        const index = this.tableNode.findIndex(t => t.dataset.attribute === attribute)

        switch(attribute){
            case 'hp':
                this.tableNode[index].innerText = `${inspectingCharacter.totalAttribute.hp} / ${inspectingCharacter.totalAttribute.maxHp}`
            break;
            case 'mp':
                this.tableNode[index].innerText = `${inspectingCharacter.totalAttribute.mp} / ${inspectingCharacter.totalAttribute.maxMp}`
            break;
            default:
                this.tableNode[index].innerText = inspectingCharacter.totalAttribute[attribute]
            break;
        }
    }

    resize(){
        
    }
}