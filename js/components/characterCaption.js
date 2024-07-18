import setting from "../utils/setting";

export default class CharacterCaption extends HTMLElement {
    static observedAttributes = ["character", "show"];

    constructor(){
        super()
    }

    connectedCallback(){
        this.innerHTML = this.render()
        this.setAttribute("id", "character-caption")
        this.className = "absolute invisible bg-white"
    }

    attributeChangedCallback(name, oldValue, newValue){
        console.log(`Attribute ${name} has changed from ${oldValue} to ${newValue}.`);

        if(name === "character"){
            if(newValue){
                const { tileSize} = setting.general   
                const { width } = setting.general.camera  
                // Rerender the element 
                this.innerHTML = this.render(newValue)
    
                const x = parseInt(newValue.x / tileSize)
                const y = parseInt(newValue.y / tileSize)
    
                // Shift UI position based on the character position
                if(y > 7 && x < Math.floor(9/2)){
                    this.style.left = ((tileSize * 9) - this.clientWidth) + 'px'
                }else{
                    this.style.left = 'unset'
                }
    
                // Shift UI position based on the character position
                if(y < 7 && x < Math.floor(9/2)){
                    document.getElementById("action-menu").style.left = (tileSize * 6) + 'px'
                }else{
                    document.getElementById("action-menu").style.left = 'unset'
                }  
            }
        }

        if(name === "show"){
            if(newValue === "true"){
                this.classList.remove("invisible")
            }else{
                this.classList.add("invisible")
            }
        }
    }

    render(character=null) {
        const { fontSize, fontSize_sm } = setting.general 

        this.style.width = Math.floor(50 * (setting.general.camera.width / 100)) + 'px'

        if(character !== null){
            character = JSON.parse(character)
        }

        return `
            <div class="caption_top flex">
                <h5 id="name" style="font-size:${fontSize}px">
                    ${character?.name}
                </h5>
                <span class="flex" style="align-item:center">
                    <span id="lv" style="font-size:${fontSize_sm}px">LV ${character?.lv}</span>
                    <span class="hint" style="display:${character?.pt > 0? 'block' : 'none'};font-size:${fontSize_sm}px">&#11205;</span>
                </span>
                <span id="ap" style="font-size:${fontSize_sm}px">AP ${character?.totalAttribute?.ap}</span>
            </div>
            
            <ul>
                <li class="gauge" style="height:${fontSize_sm}px">
                    <div class="hp" ${character !== null? `style="width:${this.getPercentage('hp', character.totalAttribute)}%;height:100%;"` : ''}></div>
                </li>
                <li class="gauge" style="height:${fontSize_sm}px">
                    <div class="mp" ${character !== null? `style="width:${this.getPercentage('mp', character.totalAttribute)}%;height:100%;"` : ''}></div>
                </li>
            </ul>
        `
    }

    // Calculate the percentage of an attribute
    getPercentage(type, totalAttribute){
        let each = 0
        let percentage = 0

        if(type === 'hp'){
            each =  totalAttribute.maxHp / 100
            percentage = Math.round( Math.floor(totalAttribute.hp / each) )
        }else{
            each = totalAttribute.maxMp / 100
            percentage = Math.round( Math.floor(totalAttribute.mp / each) )
        }

        return percentage
    }

    resize(character=null){
        this.innerHTML = this.render(character)
    }
}

customElements.define("character-caption", CharacterCaption);