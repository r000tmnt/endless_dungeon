import { resizeHiddenElement } from './utils/ui.js'
import game from './game.js'
import { changeLanguage, i18n, t } from './utils/i18n.js'
import { reRenderUi } from './utils/ui.js'

export default class Option{
    constructor(mode){
        this.mode = mode
    }

    setPartyWindow(player, setting, action){
        const partyWindow = document.getElementById('party')
        const memberList = document.getElementById('member_list')
        const {fontSize, fontSize_md, fontSize_sm, camera } = setting.general
        const { width, height } = camera
        const { itemBlockSize, itemBlockMargin } = setting.inventory

        resizeHiddenElement(partyWindow.style, width, height, fontSize_md)

        partyWindow.children[0].innerText = t('ui.option.party')
        memberList.style.fontSize = fontSize_md + 'px'
        memberList.style.maxHeight = (itemBlockSize * 3) + 'px'

        for(let i=0; i < player.length; i++){
            const member = document.createElement('li')
            const memberIcon = document.createElement('img')
            const memberName = document.createElement('span')
            const memberLv = document.createElement('span')
            member.classList.add('member')
            member.classList.add('flex') 
            member.style.margin = `${itemBlockMargin}px 0`
            member.style.padding = `${itemBlockMargin}px`
            // member click event
            member.addEventListener('click', () => {
                action.mode = 'status'
                resizeHiddenElement(document.getElementById('status').style, width, height, fontSize_sm)
                action.setStatusWindow(player[i], fontSize, fontSize_md, fontSize_sm, width)
            })   
            
            memberIcon.setAttribute('alt', 'icon')
            memberIcon.style.width = itemBlockSize + 'px'
            memberIcon.style.height = itemBlockSize + 'px'
            memberLv.innerText = `Lv ${player[i].lv}`
            memberName.innerText = player[i].name
            member.append(memberIcon)
            member.append(memberLv)
            member.append(memberName)
            memberList.append(member)
        }
    }

    resizePartyWindow(setting){
        const memberList = document.getElementById('member_list')
        const member = memberList.querySelectorAll('.member')
        const { fontSize_md } = setting.general
        const { itemBlockSize, itemBlockMargin } = setting.inventory

        memberList.style.fontSize = fontSize_md + 'px'
        memberList.style.maxHeight = (itemBlockSize * 3) + 'px'

        for(let i=0; i < member.length; i++){
            const memberIcon = member[i].querySelector('img')
            member.style.margin = `${itemBlockMargin}px 0`
            member.style.padding = `${itemBlockMargin}px`

            memberIcon.style.width = itemBlockSize + 'px'
            memberIcon.style.height = itemBlockSize + 'px'
        }
        memberList.style.maxHeight = setting.general.itemBlockSize + 'px'
    }

    cleatPartyWindow(target){
        const memberList = document.getElementById('member_list')
        while(memberList.firstChild){
            memberList.removeChild(memberList.firstChild)
        }

        resizeHiddenElement(target, 0, 0, 0)
    }

    setObjectiveWindow(target, setting, objective){
        const list = target.querySelectorAll('li')
        const desc = target.querySelectorAll('.desc')
        const { fontSize, fontSize_md, fontSize_sm, camera } = setting.general
        const { width, height } = camera
        const lng = i18n.language

        target.children[0].innerText = t('ui.option.objective')
        target.children[0].style.fontSize = fontSize + 'px'
        target.style.fontSize = fontSize_md + 'px'
        target.style.width = width + 'px'
        target.style.height = height + 'px'
        target.style.padding = fontSize_md + 'px'

        for(let i=0; i < desc.length; i++){
            // list[i].style.height = ((height - (fontSize_md * 6)) * 0.3) + 'px'
            list[i].style.margin = `${fontSize_md}px 0`
            list[i].children[0].style.marginTop = (0 - fontSize) + 'px'
            list[i].children[0].style.padding = fontSize_sm + 'px'
            const obj = desc[i].dataset.objective
            list[i].children[0].innerText = t(`ui.objective.${obj}`)
            switch(obj){
                case 'victory':
                    if(objective.victory.target === 'enemy'){
                        if(objective.victory.value === 0){
                            desc[i].innerText = (lng === 'en')? 'Defeat All enemies' : '擊退所有敵人'
                        }else{
                            desc[i].innerText = (lng === 'en')? `Defeat ${objective.victory.value} enemies` : `打倒${objective.victory.value}個敵人`
                        }
                    }
                break;
                case 'fail':
                    if(objective.fail.target === 'player'){
                        if(typeof objective.fail.value === "number"){
                            if(objective.fail.value === 0){
                                desc[i].innerText = (lng === 'en')? 'Party member All down' : '隊伍全滅'
                            }else{
                                desc[i].innerText = (lng === 'en')? `Lose ${objective.fail.value} party member` : `${objective.fail.value}個同伴倒下`
                            }                            
                        }else{
                            // TODO: If the targeted player lose
                        }
                    }
                break;
                case 'optional':
                    for(let j=0; j < objective.optional.length; j++){
                        if(objective.optional[j].target === 'turn'){
                            desc[i].innerText = (lng === 'en')? `Finish the level in ${objective.optional[j].value} turns\n` : `${objective.optional[j].value}回合結束關卡`
                        }                        
                    }
                break;
            }
        }

        target.classList.remove('invisible')
        target.classList.add('open_window')
    }

    resizeObjectiveWindow(target, setting){
        const list = target.querySelectorAll('li')
        const desc = target.querySelectorAll('.desc')
        const { fontSize, fontSize_md, fontSize_sm, camera } = setting.general
        const { width, height } = camera

        target.children[0].style.fontSize = fontSize + 'px'
        target.style.fontSize = fontSize_md + 'px'
        target.style.width = width + 'px'
        target.style.height = height + 'px'
        target.style.padding = fontSize_md + 'px'

        for(let i=0; i < desc.length; i++){
            // list[i].style.height = ((height - (fontSize_md * 6)) * 0.3) + 'px'
            list[i].style.margin = `${fontSize_md}px 0`
            list[i].children[0].style.marginTop = (0 - fontSize) + 'px'
            list[i].children[0].style.padding = fontSize_sm + 'px'
        }
    }

    setConfigWindow(setting){
        const configWindow = document.getElementById('config')
        const configOption = document.getElementById('config_option')
        const title = configWindow.children[0]
        const { fontSize, fontSize_md, camera } = setting.general
        const { width, height } = camera

        title.innerText = t('ui.option.config')
        title.style.fontSize = fontSize + 'px'
        configWindow.style.fontSize = fontSize_md + 'px'
        configOption.style.width = (width - (fontSize_md * 2)) + 'px'

        resizeHiddenElement(configWindow.style, width, height, fontSize_md)
    }

    setConfigOption(setting){
        const options = document.getElementById('config_option').querySelectorAll('input')
        for(let i=0; i< options.length; i++){
            switch(options[i].dataset.config){
                case 'bgm':
                    options[i].value = setting.general.bgm
                    options[i].addEventListener('input', (e) => {
                        const volume = Number(e.target.value)
                        setting.general.bgm = volume
                        game.bgAudio.element.volume = volume / 100
                        console.log("volume:>>> ", game.bgAudio.element.volume)
                    })
                break;
                case 'se':
                    options[i].value = setting.general.se
                    options[i].addEventListener('input', (e) => {
                        const volume = Number(e.target.value) / 100
                        setting.general.bgm = Number(e.target.value)
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
                break;
                case 'grid':
                    options[i].checked = options[i].value === String(setting.general.showGrid)

                    options[i].addEventListener('click', () => {
                        // event.preventDefault()

                        console.log(options[i].checked)

                        setting.general.showGrid = options[i].value === 'true'? true : false
                    })
                break;
                case 'filter':
                    options[i].checked = options[i].value === setting.general.filter

                    options[i].addEventListener('click', () => {
                        setting.general.filter = options[i].value
                    })
                break;
                case 'language':
                    options[i].checked = i18n.language === options[i].value
                    
                    options[i].addEventListener('click', (e) => {
                        localStorage.setItem('lng', e.target.value)
                        changeLanguage(e.target.value)
                        reRenderUi(game)
                        document.getElementById('config').children[0].innerText = t('ui.option.config')
                    })
                break;
            }
        }
    }
}
