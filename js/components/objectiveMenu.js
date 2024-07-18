

import setting from "../utils/setting"
import { i18n, t } from '../utils/i18n.js'
import { resizeHiddenElement } from '../utils/ui.js'
import game from "../game.js"

export default class ObjectiveMenu extends HTMLElement {
    static observedAttributes = ["show"];

    constructor(){
        super()
    }

    connectedCallback(){
        this.render()
        this.setAttribute("id", "objective-menu")
        this.className = "menu absolute invisible border-box text-white bg-black"
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`Attribute ${name} has changed to ${newValue}.`);

        if(newValue === 'true'){
            this.resize()
            this.classList.remove("invisible")
            this.classList.add("open_window")
        }else{
            this.classList.remove("open_window")
            this.classList.add("invisible")
        }
    }

    render(){
        const { fontSize, fontSize_md, fontSize_sm, camera } = setting.general
        const { width, height } = camera

        this.style.fontSize = fontSize_md + 'px'
        resizeHiddenElement(this.style, width, height, fontSize_md)

        this.innerHTML = `
            <div style="fontSize:${fontSize}px">
                ${t('ui.option.objective')}
            </div>

            <button 
                class="back absolute" 
                data-action="objective" 
                type="button"
                style="transform: translateX(-${fontSize_sm}px);top: ${fontSize_sm}px;fontSize: ${fontSize_md}px" >
                    ${t('back')}
                </button>
            <ul>
                <li 
                    class="bg-black"
                    style="margin:${fontSize_md}px 0;padding:${fontSize_md}px">
                   <div 
                    class="label bg-black relative">
                        ${t(`ui.objective.victory`)}
                    </div> 
                   <div class="desc" data-objective="victory"></div>
                </li>
                <li 
                    class="bg-black"
                    style="margin:${fontSize_md}px 0;padding:${fontSize_md}px">
                    <div 
                        class="label bg-black relative">
                            ${t(`ui.objective.fail`)}
                        </div>
                    <div class="desc" data-objective="fail"></div>
                </li>
                <li 
                    class="bg-black"
                    style="margin:${fontSize_md}px 0;padding:${fontSize_md}px">
                    <div 
                        class="label bg-black relative">
                            ${t(`ui.objective.optional`)}
                        </div> 
                    <div class="desc" data-objective="optional"></div>
                </li>
            </ul>
        `

        // Close button click event
        game.actionCancelSound.bindTarget(this.children[1])
        this.children[1].addEventListener('click', () => {
            game.option = ''
            this.setAttribute("show", false)
        })
    }

    formObjectiveMessage(objective, type, lng){
        let message = ''
        switch(type){
            case 'victory':
                if(objective.victory.target === 'enemy'){
                    if(objective.victory.value === 0){
                        message = (lng === 'en')? 'Defeat All enemies' : '擊退所有敵人'
                    }else{
                        message = (lng === 'en')? `Defeat ${objective.victory.value} enemies` : `打倒${objective.victory.value}個敵人`
                    }
                }
            break;
            case 'fail':
                if(objective.fail.target === 'player'){
                    if(typeof objective.fail.value === "number"){
                        if(objective.fail.value === 0){
                            message = (lng === 'en')? 'Party member All down' : '隊伍全滅'
                        }else{
                            message = (lng === 'en')? `Lose ${objective.fail.value} party member` : `${objective.fail.value}個同伴倒下`
                        }                            
                    }else{
                        // TODO: If the targeted player lose
                    }
                }
            break;
            case 'optional':
                for(let j=0; j < objective.optional.length; j++){
                    if(objective.optional[j].target === 'turn'){
                        message = (lng === 'en')? `Finish the level in ${objective.optional[j].value} turns\n` : `${objective.optional[j].value}回合結束關卡`
                    }                        
                }
            break;
        }

        return message
    }

    resize(){
        this.render()
        this.renderObjective()
    }

    renderObjective(){
        const desc = this.querySelectorAll(".desc")

        for(let i=0; i < desc.length; i++){
            desc[i].innerHTML = this.formObjectiveMessage(game.level.objective, desc[i].dataset.objective, i18n.language)
        }
    }
}

customElements.define("objective-menu", ObjectiveMenu)