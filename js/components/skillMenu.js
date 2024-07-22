import { t } from "../utils/i18n"
import setting from "../utils/setting"
import game from "../game"
import skills from "../dataBase/skill"
import skill_type from "../dataBase/skill/skill_type"
import { displayUIElement, resizeHiddenElement } from '../utils/ui'

export default class SkillMenu extends HTMLElement {
    static observedAttributes = ["show"]

    constructor(){
        super()
        this.list = null
    }

    connectedCallback() {
        this.render()
        this.setAttribute("id", "skill-menu")
        this.className = "menu absolute invisible border-box text-white bg-black"
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if(newValue === 'true'){
            const { fontSize_md, fontSize_sm, tileSize, camera } = setting.general
            const { width, height } = camera

            resizeHiddenElement(this.style, width, height, fontSize_sm)

            this.list.innerHTML = game.inspectingCharacter.skill.map(skill => {
                const skillData = skills.getOne(skill)

                return `
                    <li class="skill flex bg-black"
                        style="font-size:${fontSize_md}px; box-sizing:border-box; padding:${fontSize_sm}px;${this.ifSkillAvailable(skillData)? '' : 'color:grey' }"
                        data-skill="${JSON.stringify(skillData)}">
                        <img src="" alt="icon"
                            class="icon"
                            style="width:${tileSize}px; height:${tileSize}px; margin-right:${fontSize_sm}px"/>
                        <div class="w-full">
                            <div class="flex" style="justify-content:space-between">
                                <sapn>
                                    ${ t(`skill.${skillData.id}.name`) }
                                </sapn>
                                <span>
                                    ${skillData.cost.attribute}: ${skillData.cost.value}
                                </span>
                            </div>
                            <div>
                                ${t(`skill.${skillData.id}.desc`)}
                            </div>
                        </div>
                    </li>
                `
            })

            // Bind click event
            document.querySelectorAll(".skill").forEach(s => {
                if(s.style.color !== 'grey'){
                    s.addEventListener('click', () => {
                        game.action.useSkillasync(JSON.parse(s.dataset.skill)).then(() => {
                            this.setAttribute("show", false)
                        })
                    })
                }else{
                    s.addEventListener('click', () => {
                        console.log("Not enough resouce")
                    })
                }
            })

            this.classList.remove('invisible')
            this.classList.add('open_window')
        }else{
            this.classList.remove('open_window')
            this.classList.add('invisible')
        }
    }

    render(){
        const { fontSize, fontSize_md, fontSize_sm } = setting.general
        const { itemBlockSize } = setting.inventory

        this.innerHTML = `
            <div style="font-size:${fontSize}px">
                ${ t("ui.action.skill") }
            </div>

            <button 
                class="back absolute" 
                data-action="skill" 
                type="button"
                style="transform: translateX(-${fontSize_sm}px);top: ${fontSize_sm}px;font-size: ${fontSize_md}px" >
                    ${t('back')}
                </button>

            <ul class="learned-skills disable-scrollbars"
                style="max-height:${itemBlockSize * 3}px">
                <!-- skills -->
            </ul>
        `

        this.list = this.querySelector(".learned-skills")

        // Close button event
        this.children[1].addEventListener("click", () => {
            game.action.mode = ''
            this.setAttribute("show", false)
            displayUIElement()
        })
    }

    ifSkillAvailable(skillData){
        console.log("check :>>>", skill_type[skillData.type])

        let result = false

        if(game.inspectingCharacter.totalAttribute[skillData.cost.attribute] >= skillData.cost.value){
            if(skill_type[skillData.type].category === 'none' || skill_type[skillData.type].category === 'status'){
                result = true
            }else
            if(game.inspectingCharacter.equip.hand?.id.includes(skill_type[skillData.type].category)){
                result = true
            }else{
                result = false
            }
        }else{
            result = false
        }

        return result
    }

    resize(){
        const { fontSize, fontSize_md, fontSize_sm, tileSize } = setting.general
        const { itemBlockSize } = setting.inventory

        this.children[0].style.fontSize = fontSize + 'px'
        this.list.style.maxHeight = (itemBlockSize * 3) + 'px'

        document.querySelectorAll(".skill").forEach(skill => {
            skill.style.fontSize = fontSize_md + 'px'
            skill.style.padding = `${fontSize_sm}px` 
            skill.children[0].style.width = tileSize + 'px'
            skill.children[0].style.height = tileSize + 'px'
            skill.children[0].style.marginRight = `${fontSize_sm}px`
        })
    }
}

customElements.define("skill-menu", SkillMenu)