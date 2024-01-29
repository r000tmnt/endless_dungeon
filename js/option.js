export default class Option{
    constructor(mode){
        this.mode = mode
    }

    setPartyWindow(player, setting, action){
        const memberList = document.getElementById('member_list')
        const { fontSize_md } = setting.general
        const { itemBlockSize, itemBlockMargin } = setting.inventory

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

    cleatPartyWindow(){
        const memberList = document.getElementById('member_list')
        while(memberList.firstChild){
            memberList.removeChild(memberList.firstChild)
        }
    }

    setConfigOptions(setting){
        const options = document.getElementById('config_option').querySelectorAll('input')

        for(let i=0; i< options.length; i++){
            switch(options[i].dataset.config){
                case 'grid':
                    options[i].checked = setting.general.showGrid

                    options[i].addEventListener('click', (event) => {
                        event.preventDefault()
                        console.log('gridToggle :>>>', event)
                        event.target.checked = !setting.general.showGrid
                        setting.general.showGrid = !setting.general.showGrid
                    })
                break;
            }
        }
    }
}
