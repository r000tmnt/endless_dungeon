import { resizeHiddenElement } from './utils/ui.js'

export default class Option{
    constructor(mode){
        this.mode = mode
    }

    setPartyWindow(player, setting, action){
        const partyWindow = document.getElementById('party')
        const memberList = document.getElementById('member_list')
        const { fontSize_md, camera } = setting.general
        const { width, height } = camera
        const { itemBlockSize, itemBlockMargin } = setting.inventory

        resizeHiddenElement(partyWindow.style, width, height, fontSize_md)

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
                action.setStatusWindow(player[i])
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
        const { fontSize, fontSize_md, camera } = setting.general
        const { width, height } = camera

        target.children[0].style.fontSize = fontSize + 'px'
        target.style.fontSize = fontSize_md + 'px'
        target.style.width = width + 'px'
        target.style.height = height + 'px'
        target.style.padding = fontSize_md + 'px'

        for(let i=0; i < desc.length; i++){
            // list[i].style.height = ((height - (fontSize_md * 6)) * 0.3) + 'px'
            list[i].style.margin = `${fontSize_md}px 0`
            switch(desc[i].dataset.objective){
                case 'victory':
                    if(objective.victory.target === 'enemy'){
                        if(objective.victory.value === 0){
                            desc[i].innerText = 'Defeat All enemies'
                        }else{
                            desc[i].innerText = `Defeat ${objective.victory.value} enemies`
                        }
                    }
                break;
                case 'fail':
                    if(objective.fail.target === 'player'){
                        if(typeof objective.fail.value === "number"){
                            if(objective.fail.value === 0){
                                desc[i].innerText = 'Party member All down'
                            }else{
                                desc[i].innerText = `Lose ${objective.fail.value} party member`
                            }                            
                        }else{
                            // TODO: If the targeted player lose
                        }
                    }
                break;
                case 'optional':
                    for(let j=0; j < objective.optional.length; j++){
                        if(objective.optional[j].target === 'turn'){
                            desc[i].innerText = `Finish the level in ${objective.optional[j].value} turns\n`
                        }                        
                    }
                break;
            }
        }

        target.classList.remove('invisible')
        target.classList.add('open_window')
    }

    setConfigWindow(setting){
        const configWindow = document.getElementById('config')
        const title = configWindow.children[0]
        const { fontSize, fontSize_md, camera } = setting.general
        const { width, height } = camera

        title.style.fontSize = fontSize + 'px'
        configWindow.style.fontSize = fontSize_md + 'px'

        resizeHiddenElement(configWindow.style, width, height, fontSize_md)
    }

    setConfigOption(setting){
        const options = document.getElementById('config_option').querySelectorAll('input')
        for(let i=0; i< options.length; i++){
            switch(options[i].dataset.config){
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
            }
        }
    }
}
