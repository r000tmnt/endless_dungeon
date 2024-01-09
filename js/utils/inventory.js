import weapon from '../dataBase/item/item_weapon.js'
import armor from '../dataBase/item/item_armor.js'
import key from '../dataBase/item/item_key.js'
import potion from '../dataBase/item/item_potion.js'
// and more ...

/**
 * The item which you clicked
 */
var selectedItem = {}

/**
 * The array of actived filter
 */
var filter = []

/**
 * Get item data url from type
 * @param {number} itemType - A number represent the type of the item 
 * @returns A string of routes to get item data
 */
const getItemType = (item) => {
    let data = {}
    switch(item.type){
        case 0:
            data = potion.getOne(item.id)
        break;
        case 1:
        break;
        case 2:
        break;
        case 3:
            data = weapon.getOne(item.id)
        break;
        case 4:
            data = armor.getOne(item.id)
        break;
        case 5:
        break;
        case 6:
            data = key.getOne(item.id)
        break;
    }

    return data
}

/**
 * Display tooltip on the screen
 * @param {object} currentActingPlayer - An object represend the current acting character 
 * @param {object} hoverItem - The item you clicked 
 * @param {htmlElement} - The element you clicked
 */
const showItemToolTip = (currentActingPlayer, hoverItem, target) => {
    const toolTips = document.querySelectorAll('.item-toolTip')
    let attributeChanges = 0

    const { attributes, equip } = currentActingPlayer

    if(hoverItem.type === 3 || hoverItem.type === 4){
        // Calculate attribute changes if equip
        // If is the same item
        const sameItem = Object.entries(equip).findIndex(e => e.id === hoverItem.id)

        for(let key in Object.entries(hoverItem.effect.base_attribute)){
            if(sameItem < 0){
                const attributeTag = toolTips[selectedItem.index].children[0]
                const valueTage = toolTips[selectedItem.index].children[1]
                const itemToChange = Object.values(equip).find(e => e.id === hoverItem.id)

                const itemData = (hoverItem.type === 3)? weapon.getOne(itemToChange.id) : armor.getOne(itemToChange.id)

                if(itemData?.effect?.base_attribute[key]){
                    attributeChanges = (attributes[key] - itemData.effect.base_attribute[key]) + hoverItem.effect.base_attribute[key] 
                    attributeTag.innerText = `${key} `
                    valueTage.innerText = attributeChanges
                    valueTage.style.color = (attributeChanges > 0)? 'green' : 'red'
                    toolTips[selectedItem.index].append(attributeTag)
                    toolTips[selectedItem.index].append(valueTage)
                }
            }
        }      
    }else{
        // Display discription only
        const attributeTag = toolTips[selectedItem.index].children[0]
        attributeTag.innerText = hoverItem.effect.desc
    }
    
    // Hide previous shown toolTip
    
    toolTips.forEach((t, index) => {
        if(index !== selectedItem.index){
            t.style.visibility = 'hidden'
        }else{
            t.style.visibility = 'visible'
        }
    })

}

/**
 * Open a small menu when clicked on an item
 * @param {object} currentActingPlayer - An object represent current acting player 
 * @param {object} clickedItem - An object represent the selected item  
 */
const openItemSubMenu = (currentActingPlayer, clickedItem) =>{
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

        const equipped = Object.entries(equip).findIndex(e => e.id === clickedItem.id)

        itemActions.forEach(i => {
            if(i.dataset.action === 'use'){
                i.style.display = 'none'
            }

            if(equipped >= 0 && i.dataset.action === 'equip'){
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

/**
 * Filter inventory items
 * @param {string} type - A string of number represent the type of the item
 */
const filterItem = (type) => {
    // Check if the filter is selected
    if(filter.findIndex(f => f === type) < 0){
        filter.push(type)
        // TODO: Change btn style
    }else{
        filter.splice(filterIndex, 1)
        // TODO: Change btn style
    }

    const items = document.querySelectorAll('.item')

    if(filter.length){
        // Start filtering
        items.forEach(i => {
            if(filter.findIndex(f => f.includes(i.dataset.type)) >= 0){
                i.style.display = 'block'
            }else{
                i.style.display = 'none'
            }
        })     
    }else{
        // Display all items in the inventory
        items.forEach(i => {
            i.style.display = 'block'
        })  
    }
}

/**
 * Resize inventory elements on the pgae
 * @param {object} canvasPosition - An object contains information about the setting of the canvas element 
 */
export const resizeInventory = (canvasPosition) => {
    const Inventory = document.getElementById('item')
    const title = Inventory.children[0]
    const filterButton = document.querySelectorAll('.filter')
    const space = document.getElementById('inventory')
    const subMenu = document.getElementById('itemAction')
    // const itemActions = subMenu.querySelectorAll('li')
    const items = document.querySelectorAll('.item')
    const itemCounts = document.querySelectorAll('.item-count')
    const itemEquips = document.querySelectorAll('.item-equip') 
    // const itemToolTips = document.querySelectorAll('.item-toolTip')

    const fontSize = Math.floor( 10 * Math.floor(canvasPosition.width / 100))

    // Set the size of each block
    const itemBlockSize = Math.floor(canvasPosition.width / 100) * 30
    const itemBlockMargin = Math.floor((itemBlockSize / 100) * 10)

    // Apply size number
    title.style.fontSize = fontSize + 'px'
    title.style.paddingBottom = (fontSize / 2) + 'px'

    space.style.maxHeight = (itemBlockSize * 3) + 'px'
    space.style.padding = `${itemBlockMargin}px 0`
    subMenu.style.width = canvasPosition.width - fontSize + 'px'

    filterButton.forEach(f => {
        f.style.fontSize = Math.floor(fontSize / 3) + 'px'
        f.style.width = `${canvasPosition.width * 0.1}px`
        f.style.height = `${canvasPosition.width * 0.1}px`
        // f.addEventListener('click', () => filterItem(f.dataset.filter) )
    })

    items.forEach((item, index) => {
        item.style.width = itemBlockSize + 'px'
        item.style.height = itemBlockSize + 'px'
        item.style.fontSize = (fontSize / 2) + 'px'
        item.style.border = '1px dotted white'

        itemCounts[index].style.width = 'fit-content'
        itemCounts[index].style.fontSize = (fontSize / 2) + 'px'
        itemCounts[index].style.padding = `0 ${fontSize / 4}px ${fontSize / 4}px 0`
        itemCounts[index].classList.add('item-count')
    })

    itemEquips.forEach(equipBadge => {
        equipBadge.style.fontSize = (fontSize / 2) + 'px'
        equipBadge.style.width = 'fit-content'
        equipBadge.style.padding = `0 0 ${fontSize / 4}px ${fontSize / 4}px`
    })
}

/**
 * Clear the inventory elements on the page
 */
export const clearInventory = () => {
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
    const filterButton = document.querySelectorAll('.filter')

    const fontSize = Math.floor( 10 * Math.floor(canvasPosition.width / 100))
    // Set the size of each block
    const itemBlockSize = Math.floor(canvasPosition.width / 100) * 30
    const itemBlockMargin = Math.floor((itemBlockSize / 100) * 10)

    filterButton.forEach(f => {
        f.style.fontSize = Math.floor(fontSize / 3) + 'px'
        f.style.width = `${canvasPosition.width * 0.1}px`
        f.style.height = `${canvasPosition.width * 0.1}px`
        f.addEventListener('click', () => filterItem(f.dataset.filter) )
    })

    // Loop through the player's bag
    for(let i=0; i < currentActingPlayer.bag.length; i++){
        const item = document.createElement('div')
        const itemCount = document.createElement('div')
        const itemToolTip = document.createElement('span')
        const attributeTag = document.createElement('div')
        const valueTage = document.createElement('span')
        // Get item data
        const itemData = getItemType(currentActingPlayer.bag[i])

        item.setAttribute('data-id', itemData.id)
        item.setAttribute('data-type', itemData.type)
        item.setAttribute('data-limit', itemData.stackLimit)
        item.setAttribute('data-index', i)

        itemToolTip.classList.add('item-toolTip')
        itemToolTip.append(attributeTag)
        itemToolTip.append(valueTage)

        // Set long-press event
        item.addEventListener('long-press', () => {
            selectedItem = itemData
            selectedItem['index'] = i
            openItemSubMenu( currentActingPlayer, itemData)
        })

        // Set click event
        item.addEventListener('click', (e) => {
            selectedItem = itemData
            selectedItem['index'] = i
            showItemToolTip(currentActingPlayer, itemData, e.target)
        })

        // Setting inner text
        item.innerText = itemData.name
        itemCount.innerText = currentActingPlayer.bag[i].amount

        // Check if item equipped
        const equipped = Object.values(currentActingPlayer.equip).findIndex(e => e.id === itemData.id)

        if(equipped >= 0){
            // Prepare to show a little text on the bottom left of the block
            const equipBadge = document.createElement('div')
            equipBadge.classList.add('item-equip')
            equipBadge.innerText = 'E'
            equipBadge.style.fontSize = (fontSize / 2) + 'px'
            equipBadge.style.width = 'fit-content'
            equipBadge.style.padding = `0 0 ${fontSize / 4}px ${fontSize / 4}px`
            item.append(equipBadge)
        }

        console.log(item)

        itemCount.style.width = 'fit-content'
        itemCount.style.fontSize = (fontSize / 2) + 'px'
        itemCount.style.padding = `0 ${fontSize / 4}px ${fontSize / 4}px 0`
        itemCount.classList.add('item-count')

        item.style.width = itemBlockSize + 'px'
        item.style.height = itemBlockSize + 'px'
        item.style.fontSize = (fontSize / 2) + 'px'
        item.style.border = '1px dotted white'

        // If the index is the middle column
        if(((i + (i+1)) % 3) === 0){
            item.style.margin = `0 ${itemBlockMargin}px`
        }
        
        item.classList.add('item')

        // Append child to element
        item.append(itemToolTip)
        item.append(itemCount)
        space.append(item)
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

    // Hide scroll bar
    space.style.overflowY = 'scroll'
    space.classList.add('disable-scrollbars')
    space.style.maxHeight = (itemBlockSize * 3) + 'px'
    space.style.padding = `${itemBlockMargin}px 0`
    subMenu.style.width = canvasPosition.width - fontSize + 'px'

    // Display inventory
    Inventory.classList.remove('invisible')
    Inventory.classList.add('open_window')
}
