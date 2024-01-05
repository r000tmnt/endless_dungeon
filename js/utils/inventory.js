/**
 * The complete data reference of all items in the bag
 */
var inventory = []

/**
 * The item which you clicked
 */
var selectedItem = {}

/**
 * Get item data url from type
 * @param {number} itemType - A number represent the type of the item 
 * @returns A string of routes to get item data
 */
const getItemUrl = (itemType) => {
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

const showItemToolTip = (currentActingPlayer, hoverItem) => {
    const toolTips = document.querySelectorAll('.item-toolTip')

    let attributeChanges = 0

    const { attributes, equip } = currentActingPlayer

    if(hoverItem.type === 3 || hoverItem.type === 4){
        // Calculate attribute changes if equip
        // If is the same item
        const sameItem = Object.entries(equip).findIndex(e => e.id === hoverItem.id)

        for(let key in Object.entries(hoverItem.effect.base_attribute)){
            if(sameItem < 0){
                const itemToChange = Object.entries(equip).find(e => e.position === hoverItem.position)

                const itemData = inventory.find(i => i.id === itemToChange.id)

                attributeChanges = (attributes[key] - itemData.effect.base_attribute[key]) + hoverItem.effect.base_attribute[key] 
            }
        } 
    }
    


    // toolTips[selectedItem.index].style.visibility = 'visible'
}

/**
 * Open a small menu when clicked on an item
 * @param {object} currentActingPlayer - An object represent current acting player 
 * @param {object} clickedItem - An object represent the selected item  
 */
const openItemSubManu = (currentActingPlayer, clickedItem) =>{
    const subMenu = document.getElementById('itemAction')
    const desc = document.getElementById('item-desc')
    const itemActions = subMenu.querySelectorAll('li')
    // Item image or icon
    desc.children[0].src = ""

    desc.children[1].style.whiteSpace = "pre-line"
    desc.children[1].innerText = `${clickedItem.name}\n${clickedItem.effect.desc}`

    // Check item type
    if(clickedItem.type === 3 || clickedItem.type === 4){
        // If the item is a weapon or armor
        const { equip } = currentActingPlayer

        const equipted = Object.entries(equip).findIndex(e => e.id === clickedItem.id)

        itemActions.forEach(i => {
            if(i.dataset.action === 'use'){
                i.style.display = 'none'
            }

            if(equipted >= 0 && i.dataset.action === 'equip'){
                i.innerText = 'Unequip'
                i.addEventListener('click', () => {
                    UnequipItem(currentActingPlayer)
                })
            }
        })
    }else{
        itemActions.forEach(i => {
            if(i.dataset.action === 'equip')
            i.style.display = 'none'
        })
    }

    // Display sub menu
    subMenu.classList.remove('invisible')
    subMenu.classList.add('open_subWindow')
}

/**
 * Apply the item effect to the player
 * @param {object} currentActingPlayer - An object represent current acting player 
 */
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

/**
 * Equip the item to the player
 * @param {object} currentActingPlayer - An object represent current acting player 
 */
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

/**
 * Unequip the item from the player
 * @param {object} currentActingPlayer - An object represent current acting player 
 */
const UnequipItem = (currentActingPlayer) => {
    if(Object.entries(selectedItem).length){
        const itemData = inventory.find((item) => item.id === selectedItem.id)
        // clear slot
        currentActingPlayer.equip[selectedItem.position] = { }

        // Remove equipment bonus
        for(let key in Object.entries(itemData.effect.base_attribute)){
            currentActingPlayer.attributes[key] -= itemData.effect.base_attribute[key]
        }        
    }
}

/**
 * Drop the item from the player
 * @param {object} currentActingPlayer - An object represent current acting player 
 */
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

export const clearInventory = () => {
    // Clear out inventory reference
    inventory.splice(0)

    const subMenu = document.getElementById('itemAction')

    // Close sub menu
    subMenu.classList.remove('open_subWindow')
    subMenu.classList.add('invisible')

    // Get parent element
    const space = document.getElementById('inventory')

    // Clear children node    
    while(space.firstChild){
        space.removeChild(space.firstChild)
    }
    
}

/**
 * Append the all the items in to the inventory window 
 * @param {object} currentActingPlayer - An object represent current acting player 
 * @param {object} canvasPosition - Am object contains information about the canvas setting
 */
export const constructInventoryWindow = async(currentActingPlayer, canvasPosition) => {
    // Get UI elements
    const Inventory = document.getElementById('item')
    const space = document.getElementById('inventory')
    const subMenu = document.getElementById('itemAction')
    const itemActions = subMenu.querySelectorAll('li')

    // Loop through the player's bag
    for(let i=0; i < currentActingPlayer.bag.length; i++){
        const item = document.createElement('div')
        const itemCount = document.createElement('div')
        const itemToolTip = document.createElement('span')
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

                    itemToolTip.classList.add('item-toolTip')

                    // Set long-press event
                    item.addEventListener('long-press', () => {
                        selectedItem = currentActingPlayer.bag[i]
                        selectedItem['index'] = i
                        openItemSubManu( currentActingPlayer, items[j])
                    })

                    // Set hover event
                    item.addEventListener('hover', () => {
                        selectedItem = currentActingPlayer.bag[i]
                        selectedItem['index'] = i
                        showItemToolTip(currentActingPlayer, items[j])
                    })

                    // Setting inner text
                    item.innerText = items[j].name
                    itemCount.innerText = currentActingPlayer.bag[i].amount

                    // Check if item equipped
                    if(items[j].type === 3 || items[j].type === 4){
                        const equipted = Object.entries(currentActingPlayer.equip).findIndex(e => e.id === items[j].id)

                        if(equipted >= 0){
                            // Prepare to show a little text on the bottom left of the block
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
            item.append(itemToolTip)
            item.append(itemCount)
            space.append(item)

            // Display inventory
            Inventory.classList.remove('invisible')
            Inventory.classList.add('open_window')
        } catch (error) {
            console.log(error)
            return error
        }
    }

    // Set click event to sub menu buttons
    for(let i=0; i < itemActions.length; i++){
        switch(itemActions[i].dataset.action){
            case 'use':
                itemActions[i].addEventListener('click', () => {
                    useItem(currentActingPlayer)
                })
            break;
            case 'equip':
                itemActions[i].addEventListener('click', () => {
                    equipItem(currentActingPlayer)
                })
            break;
            case 'drop':
                itemActions[i].addEventListener('click', () => {
                    dropItem(currentActingPlayer)
                })
            break;
            case 'give':
                itemActions[i].addEventListener('click', () => {
                    giveItem(currentActingPlayer)
                })
            break;
            case 'close':
                itemActions[i].addEventListener('click', () => {
                    subMenu.classList.remove('open_subWindow')
                    subMenu.classList.add('invisible')
                })
            break;
        }
    }
}
