import game from "../game"
import setting from "../utils/setting"
import { 
    hideUIElement, 
    prepareInventory, 
    preparePickUpWindow, 
    resizeHiddenElement 
} from '../utils/ui'

export default class ActionMenu extends HTMLElement {
    static observedAttributes = ["show"]

    constructor(){
        super()
    }

    connectedCallback(){
        this.innerHTML = this.render()

        const actions = this.querySelectorAll('li')

        actions.forEach(action => {
            game.actionSelectSound.bindTarget(action)
            action.addEventListener('click', () => this.executeAction(action.dataset.action))
        })
    }

    attributeChangedCallback(name, oldValue, newValue){
        console.log(`Attribute ${name} has changed from ${oldValue} to ${newValue}.`);

        const show = newValue === 'true'

        if(show){
            this.classList.add('action_menu_open')
        }else{
            this.classList.remove('action_menu_open')
        }
    }

    render(){
        return `
            <ul id="action_list">
                <li class="action" data-action="move">Move</li>
                <li class="action" data-action="attack">Attack</li>
                <li class="action" data-action="skill">Skill</li>
                <li class="action" data-action="item">Item</li>
                <li class="action hide" data-action="pick">Pick</li>
                <li class="action" data-action="status">Status</li>
                <li class="action" data-action="stay">Stay</li>
            </ul>
        `
    }

    // action menu child click event
    async executeAction(action){
        game.action.mode = action
        hideUIElement() 
        const { tileSize } = setting.general
        const position = {
            col: parseInt(game.inspectingCharacter.x / tileSize),
            row: parseInt(game.inspectingCharacter.y / tileSize),
        }

        switch(action){
            case 'move':
                const possibleEncounterEnemyPosition = game.limitPositonToCheck(game.inspectingCharacter.totalAttribute.moveSpeed, position, game.enemyPosition)
                await game.action.setMove(
                    game.tileMap, 
                    game.inspectingCharacter, 
                    position, 
                    game.inspectingCharacter.totalAttribute.moveSpeed, possibleEncounterEnemyPosition.length? possibleEncounterEnemyPosition : game.enemyPosition
                )
            break;
            case 'attack':
                await game.action.setAttack(game.tileMap, game.inspectingCharacter, position, 1)
            break;   
            case "skill":{
                const { fontSize, fontSize_md, fontSize_sm, camera } = setting.general
                const { width, height } = camera
                resizeHiddenElement(skillWindow.style, width, height, fontSize_sm)
                game.action.setSKillWindow(game.inspectingCharacter, game.tileMap, position, fontSize, fontSize_md, fontSize_sm)
            }
            break;
            case 'item':
                prepareInventory(game.inspectingCharacter)
            break; 
            case 'pick':
                preparePickUpWindow()
            break;
            case 'status':{
                const { fontSize, fontSize_md, fontSize_sm, camera } = setting.general
                const { width, height } = camera
                resizeHiddenElement(statusWindow.style, width, height, fontSize_sm)
                game.action.setStatusWindow(game.inspectingCharacter, fontSize, fontSize_md, fontSize_sm, width)
            }
            break;
            case 'stay':
                setTimeout(() => {
                    game.inspectingCharacter.totalAttribute.ap = 0
                    game.characterAnimationPhaseEnded(game.inspectingCharacter)
                }, 500)
            break;
        }
    }
}

customElements.define("action-menu", ActionMenu)