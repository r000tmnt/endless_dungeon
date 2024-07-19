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
            
            this.list.innerHTML = `
                <li></li>
            `

            this.classList.remove('invisible')
            this.classList.add('open_window')
        }else{
            this.classList.remove('open_window')
            this.classList.add('invisible')
        }
    }

    render(){
        this.innerHTML = `
            <div>Skill</div>

            <button class="back absolute" data-action="skill" type="button">BACK</button>

            <ul class="learned-skills disable-scrollbars">
                <!-- skills -->
            </ul>
        `

        this.list = this.querySelector(".learned-skills")
    }
}