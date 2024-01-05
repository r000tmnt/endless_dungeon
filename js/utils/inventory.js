// The complete data reference of all items in the bag
var inventory = []

// The one which you clicked
var selectedItem = {}

const getItemUrl = (itemType) => {
    // Get item data url from type
    let requestUrl = ''
    switch(itemType){
        case 0:
            requestUrl = '../../assets/data/item/item_potion.json'
        break;
        case 1:
        break;
        case 2:
        break;
        case 3:
            requestUrl = '../../assets/data/item/item_weapon.json'
        break;
        case 4:
            requestUrl = '../../assets/data/item/item_armor.json'
        break;
        case 5:
        break;
        case 6:
        break;
    }

    return requestUrl
}

const showItemToolTip = (desc) => {}

const openItemSubManu = (clickedItem) =>{
    const itemData = inventory.find((item) => item.id === clickedItem.id)
    const subMenu = document.getElementById('itemAction')
    const desc = document.getElementById('item-desc')
    const itemActions = subMenu.querySelectorAll('li')
    // Item image or icon
    desc.children[0].src = ""

    desc.children[1].style.whiteSpace = "pre-line"
    desc.children[1].innerText = `${itemData.name}\n${itemData.effect.desc}`

    if(itemData.type === 3 || itemData === 4){
        itemActions[0].style.display = 'none'
    }else{
        itemActions[1].style.display = 'none'
    }

    subMenu.classList.remove('invisible')
    subMenu.classList.add('open_subWindow')
}

// Apply the item effect to the player
const useItem = async(currentActingPlayer) => {
    const itemData = inventory.find((item) => item.id === selectedItem.id)

    if(Object.entries(itemData).length){
        const { effect } = itemData
        switch(effect.target){
            case 'status':
                currentActingPlayer.attributes.status = 'Healthy'
                // TODO: Stop status timer?
            break;
            case 'all':
                currentActingPlayer.attributes.hp = currentActingPlayer.attributes.maxHp
                currentActingPlayer.attributes.mp = currentActingPlayer.attributes.maxMp
            break;
            default:
                if(effect.type === 0){
                    currentActingPlayer.attributes[`${effect.target}`] += effect.amount
                }else{
                    currentActingPlayer.attributes[`${effect.target}`] = Math.floor(currentActingPlayer.attributes[`${effect.target}`] * (effect.amount / 100)) 
                }
            break;
        }
    }
}

const equipItem = (currentActingPlayer) => {
    if(Object.entries(selectedItem).length){
        const itemData = inventory.find((item) => item.id === selectedItem.id)
        currentActingPlayer.equip[selectedItem.position] = { id: selectedItem.id, name: selectedItem.name }

        // Apply equipment bonus
        for(let key in Object.entries(itemData.effect.base_attribute)){
            currentActingPlayer.attributes[key] += itemData.effect.base_attribute[key]
        }        
    }
}

const dropItem = (currentActingPlayer) => {
    if(Object.entries(selectedItem).length){
        if(currentActingPlayer.bag[selectedItem.index].amount > 1){
            currentActingPlayer.bag[selectedItem.index].amount -= 1
        }else{
            currentActingPlayer.bag.splice(selectedItem.index, 1)
        }        
    }
}

const giveItem = (currentActingPlayer) => {
    // TODO: Give item to another player
}

export const constructInventoryWindow = async(currentActingPlayer, canvasPosition) => {
    const Inventory = document.getElementById('item')
    const space = document.getElementById('inventory')
    const subMenu = document.getElementById('itemAction')
    const itemActions = subMenu.querySelectorAll('li')

    // Clear out inventory reference
    inventory.splice(0)

    for(let i=0; i < currentActingPlayer.bag.length; i++){
        const item = document.createElement('div')
        const itemCount = document.createElement('div')
        // Get item url
        let requestUrl = getItemUrl(currentActingPlayer.bag[i].type)

        // Get item data
        const response = await fetch(requestUrl)

        try {
            const result = await response.json()
            console.log(result)
            console.log(typeof result)
    
            const items = Object.values(result)
    
            console.log(items)
    
            // Set inner text with item data
            for(let j=0; j < items.length; j++){
                if(items[j].id === currentActingPlayer.bag[i].id){
                    inventory.push(items[j])

                    item.setAttribute('data-id', items[j].id)
                    item.setAttribute('data-type', items[j].type)
                    item.setAttribute('data-limit', items[j].stackLimit)
                    item.setAttribute('data-index', i)

                    // Set click event
                    item.addEventListener('click', () => {
                        selectedItem = currentActingPlayer.bag[i]
                        selectedItem['index'] = i
                        openItemSubManu(currentActingPlayer.bag[i])
                    })

                    // Set hover event
                    item.addEventListener('hover', () => {
                        selectedItem = currentActingPlayer.bag[i]
                        selectedItem['index'] = i
                        showItemToolTip(items[j].effect.desc)
                    })

                    item.innerText = items[j].name
                    itemCount.innerText = currentActingPlayer.bag[i].amount

                    if(items[j].type === 3 || items[j].type === 4){
                        const equipted = Object.entries(currentActingPlayer.equip).findIndex(e => e.id === items[j].id)

                        if(equipted >= 0){
                            const equipBadge = document.createElement('div')
                            equipBadge.innerText = 'E'
                            equipBadge.style.width = 'fit-content'
                            item.append(itemCount)
                        }
                    }

                    break
                }
            }
    
            console.log(item)
            
            // Set the size of each block
            const itemBlockSize = Math.floor(canvasPosition.width / 100) * 33
            const itemBlockMargin = Math.floor((itemBlockSize / 100) * 10)

            // Apply size number
            // itemCount.style.position = 'absolute'
            itemCount.style.width = 'fit-content'
            itemCount.classList.add('item-count')

            item.style.width = itemBlockSize + 'px'
            item.style.height = itemBlockSize + 'px'

            // If the index is the middle column
            if(((i + (i+1)) % 3) === 0){
                item.style.margin = `0 ${itemBlockMargin}px`
            }
            
            item.classList.add('item')

            space.style.padding = itemBlockMargin + 'px'

            // Appen child to element
            item.append(itemCount)
            space.append(item)

            // Display inventory
            Inventory.classList.remove('invisible')
            Inventory.classList.add('open_subWindow')
        } catch (error) {
            console.log(error)
            return error
        }
    }

    for(let i=0; i < itemActions.length; i++){
        switch(itemActions[i].dataset.action){
            case 'use':
                itemActions[i].addEventListener('click', () => {
                    useItem(currentActingPlayer)
                })
            break;
            case 'equip':
                equipItem(currentActingPlayer)
            break;
            case 'drop':
                dropItem(currentActingPlayer)
            break;
            case 'give':
                giveItem(currentActingPlayer)
            break;
            case 'close':
                subMenu.classList.remove('open_menu')
                subMenu.classList.add('invisible')
            break;
        }
    }
}
