import weapon from '../dataBase/item/item_weapon.js'
import armor from '../dataBase/item/item_armor.js'
import key from '../dataBase/item/item_key.js'
import potion from '../dataBase/item/item_potion.js'
import material from '../dataBase/item/item_material.js'
import other from '../dataBase/item/item_other.js'

import { setEvent, setRange } from '../game.js'
import { getAvailableSpace } from '../utils/pathFinding.js'
import setting from './setting.js'
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
 * Dropped items to take
 */
var itemsToTake = []

const createEquipTag = (fontSize) => {
    const equipBadge = document.createElement('div')
    equipBadge.classList.add('item-equip')
    equipBadge.innerText = 'E'
    equipBadge.style.fontSize = (fontSize / 2) + 'px'
    equipBadge.style.width = 'fit-content'
    equipBadge.style.padding = `0 0 ${fontSize / 4}px ${fontSize / 4}px`    

    return equipBadge
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

    while(desc.children[1].firstChild){
        desc.children[1].removeChild(desc.children[1].firstChild)
    }

    desc.children[1].innerText = `${clickedItem.name}\n${clickedItem.effect.desc}`

    // Check item type
    if(clickedItem.type === 3 || clickedItem.type === 4){
        // If the item is a weapon or armor
        const { equip, attributes } = currentActingPlayer

        const equipped = Object.values(equip).findIndex(e => e.id === clickedItem.id)

        // Hide or display options
        itemActions.forEach(i => {
            if(i.dataset.action === 'use'){
                i.style.display = 'none'
            }

            if(i.dataset.action === 'equip'){
                i.innerText = equipped >= 0? 'Unequip' : 'Equip'
                i.style.display = 'block'
            }
        })
        // Calculate attribute changes if equip
        // If is the same item
        const sameItem = Object.values(equip).findIndex(e => e.id === clickedItem.id)

        for(let [key, value] of Object.entries(clickedItem.effect.base_attribute)){
            if(sameItem < 0){
                let attributeChanges = 0
                const itemToChange = Object.values(equip).find(e => e.id === clickedItem.id)

                // If the player is not equip with the item in the position
                if(itemToChange !== undefined){
                    const itemData = (clickedItem.type === 3)? weapon.getOne(itemToChange.id) : armor.getOne(itemToChange.id)

                    if(itemData?.effect?.base_attribute[key]){
                        attributeChanges = (attributes[key] - itemData.effect.base_attribute[key]) + clickedItem.effect.base_attribute[key] 
                    }                    
                }else{
                    attributeChanges = attributes[key] + clickedItem.effect.base_attribute[key] 
                }

                const attributeTag = `<div style="color:${(attributeChanges > currentActingPlayer.attributes[key])? 'green' : 'red'}">${key} ${attributeChanges}</div>`

                desc.children[1].insertAdjacentHTML('beforeend', attributeTag)
            }else{
                // Display current effected attributes
                let attributeTag = ``
                for(let [key, value] of Object.entries(selectedItem.effect.base_attribute)){
                    attributeTag += `<div>${key} ${value}</div>`
                }

                desc.children[1].insertAdjacentHTML('beforeend', attributeTag)
            }
        }      
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
 * @param {HTMLElementCollection} itemActions - A collection of sub menu button
 */
const setItemSpace = async(currentActingPlayer, enemyPosition, tileMap) => {
    const Inventory = document.getElementById('item')
    const itemUseRange = await getAvailableSpace(
        tileMap,
        { row: parseInt(currentActingPlayer.y / currentActingPlayer.tileSize), col: parseInt(currentActingPlayer.x / currentActingPlayer.tileSize) },
        selectedItem.effect.range, selectedItem.effect?.dmg? null: enemyPosition
    )

    setRange(itemUseRange)

    // Hide inventory
    Inventory.classList.add('invisible')
    Inventory.classList.remove('open_window')

    clearInventory()
}

/**
 * Equip the item to the player
 * @param {object} currentActingPlayer - An object represent current acting player 
 */
const equipItem = (currentActingPlayer, itemActions) => {
    if(Object.entries(selectedItem).length){
        currentActingPlayer.equip[selectedItem.position] = { id: selectedItem.id, name: selectedItem.name }

        // Apply equipment bonus
        for(let [key, value] of Object.entries(selectedItem.effect.base_attribute)){
            currentActingPlayer.attributes[key] += selectedItem.effect.base_attribute[key]
        }  

        const { fontSize } = setting.general

        // Create E tag
        const equipBadge = createEquipTag(fontSize)    

        // Insert E tag as the first child
        const equipItem = document.querySelectorAll('.item')[selectedItem.index]
        equipItem.insertBefore(equipBadge, equipItem.children[0])

        // Close sub menu
        itemActions[itemActions.length - 1].click()
    }
}

/**
 * Unequip the item from the player
 * @param {object} currentActingPlayer - An object represent current acting player 
 */
const UnequipItem = (currentActingPlayer, itemActions) => {
    if(Object.entries(selectedItem).length){
        // clear slot
        currentActingPlayer.equip[selectedItem.position] = { }

        // Remove equipment bonus
        for(let [key, value] of Object.entries(selectedItem.effect.base_attribute)){
            currentActingPlayer.attributes[key] -= selectedItem.effect.base_attribute[key]
        }  

        // Remove E tag
        document.querySelectorAll('.item')[selectedItem.index].children[0].remove()

        // Close sub menu
        itemActions[itemActions.length - 1].click()
    }
}

/**
 * Drop the item from the player
 * @param {object} currentActingPlayer - An object represent current acting player 
 * @param {HTMLElementCollection} itemActions - A collection of sub menu button 
 */
const dropItem = (currentActingPlayer, itemActions) => {
    if(Object.entries(selectedItem).length){
        const value = Number(document.getElementById('range').getAttribute('value')) 

        // Leave an item on the ground, need an sprite to draw on the tile    
        setEvent({x: currentActingPlayer.x, y: currentActingPlayer.y}, [{id: currentActingPlayer.bag[selectedItem.index].id, type: currentActingPlayer.bag[selectedItem.index].type, amount: value}])

        // If the item is equipped
        if(Object.values(currentActingPlayer.equip).findIndex(e => e.id === selectedItem.id) >= 0){
            UnequipItem(currentActingPlayer, itemActions)
        }else{
            // Close sub menu
            itemActions[itemActions.length - 1].click()
        }

        // Hide slider
        const slider = document.getElementById('slider')
        slider.classList.add('invisible')

        removeItem(currentActingPlayer, value)
    }
}

const giveItem = (currentActingPlayer) => {
    // TODO: Give item to another player
}

/**
 * Alter the quantity or remove an item from the player
 * @param {object} currentActingPlayer - An object represent current acting player
 * @param {number} value - A number to deduct
 */
// TODO: Redesign function to remove item on the screen
const removeItem = (currentActingPlayer, value) => {
    // Alter item amount or remove item
    if(currentActingPlayer.bag[selectedItem.index].amount > 1){
        const itemCount = document.querySelectorAll('.item-count')
        currentActingPlayer.bag[selectedItem.index].amount -= value
        itemCount[selectedItem.index].innerText = currentActingPlayer.bag[selectedItem.index].amount
    }else{
        let items = document.querySelectorAll('.item')
        currentActingPlayer.bag.splice(selectedItem.index, 1)
        items[selectedItem.index].remove()

        const { itemBlockMargin } = setting.inventory

        // Rearrange the style start with the index
        for(let i = selectedItem.index, items = document.querySelectorAll('.item').length; i < items; i++){
            // If the index is the middle column
            if(((i + (i+1)) % 3) === 0){
                items[i].style.margin = `0 ${itemBlockMargin}px`
            }else{
                items[i].style.margin = `unset`
            }
        }

        selectedItem.index = -1
    } 
} 

/**
 * Filter inventory items
 * @param {string} type - A string of number represent the type of the item
 */
const filterItem = (type) => {
    const filterIndex = filter.findIndex(f => f === type)
    // Check if the filter is selected
    if(filterIndex < 0){
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
 * Pick up item on the ground
 * @param {object} currentActingPlayer - An object represents current acting player
 * @param {object} tileMap - An object contains information about the tileMap
 */
const pickUpItem = (currentActingPlayer, tileMap) => {
    const pickUpWindow = document.getElementById('pickUp')
    const droppedItems = document.getElementById('dropped-items')
    const items = document.querySelectorAll('.item')

    // 1. Check if there's the same item in the bag
    // 2. check if the item will surpass the stack limit

    itemsToTake.forEach((item, index) => {
        // Get the index of displayed item
        const itemIndex = Array.from(items).findIndex(i => i.dataset.id === item.id)

        // Check if there's the same item
        const inventoryIndex = currentActingPlayer.bag.findIndex(b => b.id === item.id)
        if(inventoryIndex >= 0){
            const itemData = getItemType(currentActingPlayer.bag[inventoryIndex])

            const leftOver = itemData.stackLimit - (currentActingPlayer.bag[inventoryIndex].amount + item.amount)

            // If the item is stackable and will not surpass the limit if added
            if((currentActingPlayer.bag[inventoryIndex].amount + item.amount) <= itemData.stackLimit){
                // Stack the item
                currentActingPlayer.bag[inventoryIndex].amount += item.amount

                // Remove the item on the screen
                droppedItems.removeChild(items[itemIndex])
        
                // Remove the item in the array
                itemsToTake.splice(index, 1)

                // If there are no more items left
                if(!document.querySelectorAll('.item').length){
                    // Remove the event on the tile
                    tileMap.clearEventOnTile({x: currentActingPlayer.x, y: currentActingPlayer.y})

                    // Close pick up window
                    pickUpWindow.classList.add('invisible')
                    pickUpWindow.classList.remove('open_window')
                }
            }else{
                // Stack up to the limit
                currentActingPlayer.bag[inventoryIndex].amount = itemData.stackLimit

                // If there are available space in the bag
                if(currentActingPlayer.bag.length < currentActingPlayer.bagLimit){
                    // Take the item
                    currentActingPlayer.bag.push({ id: item.id, type: item.type, amount: Math.abs(leftOver) })
                    
                    // Remove the item on the screen
                    droppedItems.removeChild(items[itemIndex])
            
                    // Remove the item in the array
                    itemsToTake.splice(index, 1)

                    // If there are no more items left
                    if(!document.querySelectorAll('.item').length){
                        // Remove the event on the tile
                        tileMap.clearEventOnTile({x: currentActingPlayer.x, y: currentActingPlayer.y})

                        // Close pick up window
                        pickUpWindow.classList.add('invisible')
                        pickUpWindow.classList.remove('open_window')
                    }
                }else{
                    // Kepp the event with modify state
                    itemsToTake[index].amount = Math.abs(leftOver)
                    droppedItems.children[itemIndex].children[1] = Math.abs(leftOver)
                }
            }
        // If there are available space in the bag
        }else if(currentActingPlayer.bag.length < currentActingPlayer.bagLimit){
            // Take the item
            currentActingPlayer.bag.push({ id: item.id, type: item.type, amount: item.amount })

            // Remove the item on the screen
            droppedItems.removeChild(items[itemIndex])
    
            // Remove the item in the array
            itemsToTake.splice(index, 1)

            // If there are no more items left
            if(!document.querySelectorAll('.item').length){
                // Remove the event on the tile
                tileMap.clearEventOnTile({x: currentActingPlayer.x, y: currentActingPlayer.y})

                // Close pick up window
                pickUpWindow.classList.add('invisible')
                pickUpWindow.classList.remove('open_window')
            }
        }
    })

    // If there are items left
    if(document.querySelectorAll('.item').length){
        // Collect items after modification
        let leftItems = Array.from(document.querySelectorAll('.item')).map(d => {
            return { id: d.dataset.id, type: d.dataset.type, amount: d.dataset.amount }
        })

        // Modify the event on the tile
        tileMap.modifyEventOnTile({x: currentActingPlayer.x, y: currentActingPlayer.y}, leftItems)

        // Rearrange the style start with the index
        for(let i = 0, items = document.querySelectorAll('.item').length; i < items; i++){
            if(items[i] === undefined){
            continue  // Jump to the next one
            }

            // If the index is the middle column
            if(((i + (i+1)) % 3) === 0){
                items[i].style.margin = `0 ${itemBlockMargin}px`
            }else{
                items[i].style.margin = `unset`
            }
        }
    }
}

/**
 * Get item data url from type
 * @param {number} itemType - A number represent the type of the item 
 * @returns A string of routes to get item data
 */
export const getItemType = (item) => {
    let data = {}
    switch(Number(item.type)){
        case 0:
            data = potion.getOne(item.id)
        break;
        case 1:
            data = other.getOne(item.id)
        break;
        case 2:
            data = material.getOne(item.id)
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
 * Resize inventory elements on the pgae
 * @param {object} canvasPosition - An object contains information about the setting of the canvas element 
 */
export const resizeInventory = (cameraWidth, fontSize) => {
    const Inventory = document.getElementById('item')
    const title = Inventory.children[0]
    const filterButton = document.querySelectorAll('.filter')
    const space = document.getElementById('inventory')
    const subMenu = document.getElementById('itemAction')
    // const itemActions = subMenu.querySelectorAll('li')
    const items = document.querySelectorAll('.item')
    const itemCounts = document.querySelectorAll('.item-count')
    const itemEquips = document.querySelectorAll('.item-equip') 
    const desc = document.getElementById('item-desc')
    const slider = document.getElementById('slider')
    const range = document.getElementById('range')
    const btns = slider.children[2].getElementsByTagName('button')

    const { itemBlockSize , itemBlockMargin } = setting.inventory

    // Set the size of each block
    desc.children[0].style.width = (cameraWidth / 9) + 'px'
    desc.children[0].style.height = (cameraWidth / 9) + 'px'
    desc.children[1].style.whiteSpace = "pre-line"
    
    // Apply size number
    title.style.fontSize = fontSize + 'px'
    title.style.paddingBottom = (fontSize / 2) + 'px'

    space.style.maxHeight = (itemBlockSize * 3) + 'px'
    space.style.padding = `${itemBlockMargin}px 0`
    subMenu.style.width = cameraWidth - fontSize + 'px'

    filterButton.forEach(f => {
        f.style.fontSize = Math.floor(fontSize / 3) + 'px'
        f.style.width = `${cameraWidth * 0.1}px`
        f.style.height = `${cameraWidth * 0.1}px`
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

        // If the index is the middle column
        if(((index + (index+1)) % 3) === 0){
            item.style.margin = `${itemBlockMargin}px`
        }else{
            item.style.margin = `${itemBlockMargin}px 0`
        }
    })

    itemEquips.forEach(equipBadge => {
        equipBadge.style.fontSize = (fontSize / 2) + 'px'
        equipBadge.style.width = 'fit-content'
        equipBadge.style.padding = `0 0 ${fontSize / 4}px ${fontSize / 4}px`
    })

    // If the slider is shown
    if(!slider.classList.contains('invisible')){
        // Resize slider
        range.style.width = ((cameraWidth - fontSize) - itemBlockMargin) + 'px'
        range.setAttribute('max', selectedItem.amount)

        // Set the size of each block
        slider.style.width = (cameraWidth - fontSize) + 'px'
        slider.style.fontSize = fontSize + 'px'

        // Blind input event
        range.oninput = function() {
            slider.children[1].innerText = this.value;
        }

        Array.from(btns).forEach(btn => {
            btn.style.margin = `0 ${fontSize / 2}px`
            btn.style.fontSize = (fontSize / 2) + 'px'
            btn.style.width = Math.floor(cameraWidth * (30 / 100)) + 'px'
        })
    }
}

/**
 * Resize pick up elements on the pgae
 * @param {object} canvasPosition - An object contains information about the setting of the canvas element 
 */
export const resizePickUp = (fontSize, cameraWidth) => {
    const pickUpWindow = document.getElementById('pickUp')
    const title = pickUpWindow.children[0]
    // const droppedItems = document.querySelector('.dropped-items')
    const btn = document.querySelector('.btn-group')
    const items = document.querySelectorAll('.item')
    const itemCounts = document.querySelectorAll('.item-count')

    const { itemBlockSize , itemBlockMargin } = setting.inventory

    title.style.fontSize = fontSize + 'px'
    title.style.paddingBottom = (fontSize / 2) + 'px'

    btn.style.width = (cameraWidth - (Math.floor(fontSize / 2) * 2)) + 'px'
    btn.style.padding = `${Math.floor(fontSize / 2)}px 0`

    // Set confirm botton style
    btn.children[0].style.fontSize = fontSize + 'px'
    btn.children[0].style.margin = "0 auto"
    // btn.disabled = 'true'

    items.forEach((item, index) => {
        itemCounts[index].style.width = 'fit-content'
        itemCounts[index].style.fontSize = (fontSize / 2) + 'px'
        itemCounts[index].style.padding = `0 ${fontSize / 4}px ${fontSize / 4}px 0`
        itemCounts[index].classList.add('item-count')

        item.style.width = itemBlockSize + 'px'
        item.style.height = itemBlockSize + 'px'
        item.style.fontSize = (fontSize / 2) + 'px'
        item.style.border = '1px dotted white'

        // If the index is the middle column
        if(((index + (index+1)) % 3) === 0){
            item.style.margin = `${itemBlockMargin}px`
        }else{
            item.style.margin = `${itemBlockMargin}px 0`
        }
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
 * Clear the pick up window elements on the page
 */
export const clearPickUpWindow = () => {
    const droppedItems = document.getElementById('dropped-items')

    while(droppedItems.firstChild){
        droppedItems.removeChild(droppedItems.firstChild)
    }
}

export const useItem = (currentActingPlayer) => {
    if(Object.entries(selectedItem).length){
        const { effect } = selectedItem

        const itemActions = subMenu.querySelectorAll('li')

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

        removeItem(currentActingPlayer, itemActions)
    }
}

/**
 * Append the all the items in to the inventory window 
 * @param {object} currentActingPlayer - An object represent current acting player 
 */
export const constructInventoryWindow = (currentActingPlayer, enemyPosition, tileMap) => {
    // Get UI elements
    const Inventory = document.getElementById('item')
    const title = Inventory.children[0]
    const space = document.getElementById('inventory')
    const subMenu = document.getElementById('itemAction')
    const itemActions = subMenu.querySelectorAll('li')
    const filterButton = document.querySelectorAll('.filter')
    const desc = document.getElementById('item-desc')

    const { fontSize } = setting.general
    const { width } = setting.general.camera
    const { itemBlockSize, itemBlockMargin } = setting.inventory

    desc.children[0].style.width = currentActingPlayer.tileSize + 'px'
    desc.children[0].style.height = currentActingPlayer.tileSize + 'px'
    desc.children[1].style.whiteSpace = "pre-line"

    title.style.fontSize = fontSize + 'px'
    title.style.paddingBottom = (fontSize / 2) + 'px'

    filterButton.forEach(f => {
        f.style.fontSize = Math.floor(fontSize / 3) + 'px'
        f.style.width = `${width * 0.1}px`
        f.style.height = `${width * 0.1}px`
        f.addEventListener('click', () => {
            filterItem(f.dataset.filter)
            if(f.classList.contains('filtering')){
                f.classList.remove('filtering')
            }else{
                f.classList.add('filtering')
            }
        })
    })

    // Loop through the player's bag
    for(let i=0; i < currentActingPlayer.bag.length; i++){
        const item = document.createElement('div')
        const itemCount = document.createElement('div')
        // const itemToolTip = document.createElement('span')
        // Get item data
        const itemData = getItemType(currentActingPlayer.bag[i])

        item.setAttribute('data-long-press-delay', 500)

        // Set long-press event
        item.addEventListener('long-press', () => {
            if(selectedItem?.index >= 0){
                space.children[selectedItem.index].classList.remove('item-selected')
            }
            item.classList.add('item-selected')
            selectedItem = itemData
            selectedItem['index'] = i
            selectedItem['amount'] = currentActingPlayer.bag[i].amount
            openItemSubMenu( currentActingPlayer, itemData)
        })

        // Setting inner text
        item.innerText = itemData.name
        itemCount.innerText = currentActingPlayer.bag[i].amount

        // Check if item equipped
        if(Object.values(currentActingPlayer.equip).findIndex(e => e.id === itemData.id) >= 0){
            // Prepare to show a little text on the bottom left of the block
            const equipBadge = createEquipTag(fontSize) 
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

        // If the index is the middle column
        if(((i + (i+1)) % 3) === 0){
            item.style.margin = `${itemBlockMargin}px`
        }else{
            item.style.margin = `${itemBlockMargin}px 0`
        }
        
        item.classList.add('item')

        // Append child to element
        // item.append(itemToolTip)
        item.append(itemCount)
        space.append(item)
    }

    // Loop through sub menu buttons
    // Set click event to sub menu buttons
    for(let i=0; i < itemActions.length; i++){
        switch(itemActions[i].dataset.action){
            case 'use':
                if(selectedItem.type === 0){
                    const { attributes } = currentActingPlayer

                    // Disable the element if the condition is not match
                    switch(selectedItem.useCondition.compare){
                        case 'lower':
                            if(attributes[selectedItem.effect.target] >= attributes[selectedItem.useCondition.target]){
                                itemActions[i].style.pointerEvents = 'none'
                                itemActions[i].classList.add('no-event')
                            }
                        break;
                        case 'equal':
                            if(attributes[selectedItem.effect.target] !== attributes[selectedItem.useCondition.target]){
                                itemActions[i].style.pointerEvents = 'none'
                                itemActions[i].classList.add('no-event')
                            }
                        break;
                    }
                }

                itemActions[i].addEventListener('click', () => {
                    setItemSpace(currentActingPlayer, enemyPosition, tileMap)
                })
            break;
            case 'equip':
                itemActions[i].addEventListener('click', () => {
                    if(itemActions[i].innerText === 'Unequip'){
                        UnequipItem(currentActingPlayer, itemActions)
                    }else{
                        equipItem(currentActingPlayer, itemActions)
                    }
                })
            break;
            case 'drop':
                itemActions[i].addEventListener('click', () => {
                    // Open slider
                    const slider = document.getElementById('slider')
                    const range = document.getElementById('range')
                    const btns = slider.children[2].getElementsByTagName('button')

                    range.style.width = ((cameraWidth - fontSize) - itemBlockMargin) + 'px'
                    range.setAttribute('max', selectedItem.amount)

                    // Set the size of each block
                    slider.style.width = (cameraWidth - fontSize) + 'px'
                    slider.style.fontSize = fontSize + 'px'

                    // Blind input event
                    range.oninput = function() {
                        slider.children[1].innerText = this.value;
                    }

                    Array.from(btns).forEach(btn => {
                        btn.style.margin = `0 ${fontSize / 2}px`
                        btn.style.fontSize = (fontSize / 2) + 'px'
                        btn.style.width = Math.floor(cameraWidth * (30 / 100)) + 'px'
                    })

                    // Cancel button
                    btns[0].addEventListener('click', () => {
                        // Reset slider
                        slider.classList.add('invisible')
                        subMenu.classList.remove('invisible')
                        range.setAttribute('value', 1)
                    })

                    // Confirm button
                    btns[1].addEventListener('click', () => {
                        dropItem(currentActingPlayer, itemActions)
                    })

                    slider.classList.remove('invisible')
                    subMenu.classList.add('invisible')
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

    // Apply style to the item wrapper
    space.style.maxHeight = (itemBlockSize * 3) + 'px'
    space.style.padding = `${itemBlockMargin}px 0`
    subMenu.style.width = width - fontSize + 'px'

    // Display inventory
    Inventory.classList.remove('invisible')
    Inventory.classList.add('open_window')
}

/**
 * Append the all the items in to the pickup window 
 * @param {object} currentActingPlayer - An object represent current acting player 
 * @param {number} cameraWidth - The width of camera
 * @param {number} cameraHeight - The heigth of camera
 * @param {object} eventItem -An object represents dropped items on the tile
 */
export const constructPickUpWindow = (currentActingPlayer, cameraWidth, cameraHeight, eventItem, tileMap) => {
    const pickUpWindow = document.getElementById('pickUp')
    const title = pickUpWindow.children[0]
    const droppedItems = document.getElementById('dropped-items')
    const btn = document.querySelector('.btn-group')

    const { fontSize } = setting.general
    const { itemBlockSize, itemBlockMargin } = setting.inventory

    title.style.fontSize = fontSize + 'px'
    title.style.paddingBottom = (fontSize / 2) + 'px'

    // Set confirm botton style
    btn.style.width = (cameraWidth - (Math.floor(fontSize / 2) * 2)) + 'px'
    btn.style.padding = `${Math.floor(fontSize / 2)}px 0`
    btn.children[0].style.fontSize = fontSize + 'px'
    btn.children[0].style.margin = "0 auto"
    btn.children[0].setAttribute('disabled', 'true')
    
    // Set botton click event
    btn.children[0].addEventListener('click', () => {
        pickUpItem(currentActingPlayer, tileMap)
    })

    // Loop through dropped items
    for(let i=0; i < eventItem.length; i++){
        const item = document.createElement('div')
        const itemCount = document.createElement('div')
        // const itemToolTip = document.createElement('span')
        // Get item data
        const itemData = getItemType(eventItem[i])

        item.setAttribute('data-id', itemData.id)
        item.setAttribute('data-type', itemData.type)
        item.setAttribute('data-limit', itemData.stackLimit)
        item.setAttribute('data-amount', eventItem[i].amount)

        // Bind click event
        item.addEventListener('click', () => {
            const itemSelected = itemsToTake.findIndex(i => i.id === itemData.id)
            // If the item is selected
            if(itemSelected >= 0){
                // Remove from the array
                itemsToTake.splice(itemSelected, 1)
                item.classList.remove('item-selected')
                if(!itemsToTake.length) btn.children[0].setAttribute('disabled', 'ture')
            }else{
                // Append to the array
                itemsToTake.push(eventItem[i])
                item.classList.add('item-selected')
                btn.children[0].removeAttribute('disabled')
            }
        })

        // Setting inner text
        item.innerText = itemData.name
        itemCount.innerText = eventItem[i].amount

        console.log(item)

        itemCount.style.width = 'fit-content'
        itemCount.style.fontSize = (fontSize / 2) + 'px'
        itemCount.style.padding = `0 ${fontSize / 4}px ${fontSize / 4}px 0`
        itemCount.classList.add('item-count')

        item.style.width = itemBlockSize + 'px'
        item.style.height = itemBlockSize + 'px'
        item.style.fontSize = (fontSize / 2) + 'px'

        // If the index is the middle column
        if(((i + (i+1)) % 3) === 0){
            item.style.margin = `${itemBlockMargin}px`
        }else{
            item.style.margin = `${itemBlockMargin}px 0`
        }
        
        item.classList.add('item')

        // Append child to element
        // item.append(itemToolTip)
        item.append(itemCount)
        droppedItems.append(item)
    }

    // Apply style to the item wrapper
    droppedItems.style.maxHeight = (itemBlockSize * 3) + 'px'
    droppedItems.style.padding = `${itemBlockMargin}px 0`

    pickUpWindow.classList.remove('invisible')
    pickUpWindow.classList.add('open_window')
}
