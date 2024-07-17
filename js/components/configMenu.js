import game from "../game"
import setting from "../utils/setting"
import { changeLanguage, i18n, t } from '../utils/i18n.js'
import { resizeHiddenElement, reRenderUi } from '../utils/ui.js'

export default class ConfigMenu extends HTMLElement {
    static observedAttributes = ["show", "resize"]

    constructor(){
        super()
        this.list = null
    }

    connectedCallback() {
        this.innerHTML = this.render()
        this.list = this.children[2].querySelectorAll("input")
        // Close button click event
        game.actionCancelSound.bindTarget(this.children[1])
        this.children[1].addEventListener('click', () => {
            this.setAttribute("show", false)
            game.option = ''
            resizeHiddenElement(this.style, 0, 0, 0)
        })
        this.setConfigOption()
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if(name === "show"){
            if(newValue === 'true'){
                const { fontSize_md, camera } = setting.general
                const { width, height } = camera
                this.style.fontSize = setting.general.fontSize_md + 'px'
                resizeHiddenElement(this.style, width, height, fontSize_md)
                this.classList.remove('invisible')
                this.classList.add('open_window')
            }else{
                this.classList.remove('open_window')
                this.classList.add('invisible')
            }
        }

        if(name === "resize"){
            const { fontSize_md, camera } = setting.general
            const { width, height } = camera
            this.style.fontSize = setting.general.fontSize_md + 'px'
            resizeHiddenElement(this.style, width, height, fontSize_md)
        }
    }

    render(){
        const { fontSize, fontSize_md, camera } = setting.general
        const { width, height } = camera

        return `
            <div style="fontSize:${fontSize}px">
                ${t('ui.option.config')}
            </div>

            <button class="back absolute" data-action="config" type="button">${t('back')}</button>

            <table 
                id="config_option" 
                class="disable-scrollbars"
                style="width:${width - (fontSize_md * 2)}px" >
                <tbody>
                    <!-- BGM -->
                    <tr>
                        <td>${t('ui.config.bgm')}</td>
                        <td>
                            <input 
                                id="bgm" 
                                min="0" 
                                max="100" 
                                type="range" 
                                class="w-full" data-config="bgm" 
                                name="bgm"
                                value="${setting.general.bgm}"> 
                        </td>
                    </tr>
                    <!-- SE -->
                    <tr>
                        <td>${t('ui.config.se')}</td>
                        <td>
                            <input 
                                id="se" 
                                min="0" 
                                max="100" 
                                type="range" 
                                class="w-full" 
                                data-config="se" 
                                name="se"
                                value="${setting.general.se}" > 
                        </td>    
                    </tr>
                    <!-- Grid -->
                    <tr>
                        <td>${t('ui.config.grid')}</td>
                        <td class="flex evenly">
                            <label for="grid">
                                ${t('ui.config.on')}
                            </label>
                            <input 
                                type="radio" 
                                data-config="grid" 
                                name='grid' 
                                value="true"
                                ${setting.general.showGrid === true? 'checked' : ''} > 

                            <label for="grid">
                                ${t('ui.config.off')}
                            </label>
                            <input 
                                type="radio" 
                                data-config="grid" 
                                name='grid' 
                                value="false"
                                ${setting.general.showGrid === false? 'checked' : ''} >
                        </td>
                    </tr>

                    <!-- Character image filter -->
                    <tr>
                        <td>${t('ui.config.filter')}</td>

                        <td class="flex evenly">
                            <label for="default">
                                ${t('ui.config.default')}
                            </label>
                            <input 
                                type="radio" 
                                data-config="filter" 
                                name="filter" 
                                value="default"
                                ${setting.general.filter === 'default'? 'checked' : ''} > 

                            <label for="retro">
                                ${t('ui.config.retro')}
                            </label>
                            <input 
                                type="radio" 
                                data-config="filter" 
                                name="filter" 
                                value='retro'
                                ${setting.general.filter === 'retro'? 'checked' : ''}>
                        </td>
                    </tr> 
                    
                    <!-- Language selector -->
                    <tr>
                        <td>
                            ${t('ui.config.language')}
                        </td>
                        <td class="flex evenly">
                            <label for="default">
                                English
                            </label>
                            <input 
                                type="radio" 
                                data-config="language" 
                                name="language" 
                                value="en"
                                ${i18n.language === 'en'? 'checked' : ''} > 

                            <label for="retro">
                                繁體中文
                            </label>
                            <input 
                                type="radio" 
                                data-config="language" 
                                name="language" 
                                value='zh'
                                ${i18n.language === 'zh'? 'checked' : ''} >
                        </td>
                    </tr>
                </tbody>
            </table>
        `
    }

    setConfigOption(){
        for(let i=0; i < this.list.length; i++){
            switch(this.list[i].dataset.config){
                case 'bgm':
                    this.list[i].addEventListener('input', () => {
                        const volume = Number(this.list[i].value)
                        setting.general.bgm = volume
                        game.bgAudio.element.volume = volume / 100
                        console.log("volume:>>> ", game.bgAudio.element.volume)                        
                    });
                break;
                case 'se':{
                    this.list[i].addEventListener("input", () => {
                    const volume = Number(this.list[i].value) / 100
                    setting.general.bgm = Number(this.list[i].value)
                    game.clickSound.element.volume = volume
                    game.menuOpenSound.element.volume = volume
                    game.menuCloseSound.element.volume = volume
                    game.actionSelectSound.element.volume = volume
                    game.actionCancelSound.element.volume = volume
                    // game.attackSound.element.volume = volume
                    game.missSound.element.volume = volume
                    game.potionSound.element.volume = volume
                    // game.walkingSound.element.volume = volume
                    // game.equipSound.element.volume = volume
                    // game.unEquipSound.element.volume = volume
                    // game.keySound.element.volume = volume
                    // game.selectSound.element.volume = volume
                    game.levelUpSound.element.volume = volume
                    })
                }
                break;
                case 'grid':
                    this.list[i].addEventListener('click', () => {
                        setting.general.showGrid = this.list[i].value === 'true'? true : false
                    })
                break;
                case 'filter':
                    this.list[i].addEventListener('click', () => {
                        setting.general.showGrid = this.list[i].value === 'true'? true : false
                    })
                break;
                case 'language':
                    this.list[i].addEventListener('click', () => {
                        localStorage.setItem('lng', this.list[i].value)
                        changeLanguage(this.list[i].value)
                        this.children[0].innerText = t('ui.option.config')
                        reRenderUi(game)                        
                    })
                break;
            }
        }
    }
}

customElements.define("config-menu", ConfigMenu)