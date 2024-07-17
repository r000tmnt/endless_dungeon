

import setting from "../utils/setting"

export default class ObjectiveMenu extends HTMLElement {
    constructor(){
        super()
    }

    connectedCallback(){
        this.innerHTML = this.render()
    }

    render(){
        const { fontSize, fontSize_md, fontSize_sm, camera } = setting.general
        const { width, height } = camera

        return `
            <div>Objective</div>

            <button 
                class="back absolute" 
                data-action="objective" 
                type="button"
                style="transform: translateX(-${fontSize_sm}px);top: ${fontSize_sm}px;fontSize: ${fontSize_md}px" 
            <ul>
                <li class="bg-black">
                   <div class="label bg-black relative">Victory</div> 
                   <div class="desc" data-objective="victory"></div>
                </li>
                <li class="bg-black">
                    <div class="label bg-black relative">Fail</div>
                    <div class="desc" data-objective="fail"></div>
                </li>
                <li class="bg-black">
                    <div class="label bg-black relative">Optional</div> 
                    <div class="desc" data-objective="optional"></div>
                </li>
            </ul>
        `
    }
}