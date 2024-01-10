import weapon from '../dataBase/item/item_weapon.js'
import armor from '../dataBase/item/item_armor.js'
import key from '../dataBase/item/item_key.js'
import potion from '../dataBase/item/item_potion.js'

import { setEvent } from '../game.js'
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

    // Set click event to sub menu buttons
    for(let i=0; i < itemActions.length; i++){
        switch(itemActions[i].dataset.action){
            case 'use':
                if(clickedItem.type === 0){
                    const { attributes } = currentActingPlayer

                    // Disable the element if the condition is not match
                    switch(clickedItem.useCondition.compare){
                        case 'lower':
                            if(attributes[clickedItem.effect.target] >= attributes[clickedItem.useCondition.target]){
                                itemActions[i].style.pointerEvents = 'none'
                                itemActions[i].classList.add('no-event')
                            }
                        break;
                        case 'equal':
                            if(attributes[clickedItem.effect.target] !== attributes[clickedItem.useCondition.target]){
                                itemActions[i].style.pointerEvents = 'none'
                                itemActions[i].classList.add('no-event')
                            }
                        break;
                    }
                }

                itemActions[i].addEventListener('click', () => {
                    useItem(currentActingPlayer, clickedItem)
                })
            break;
            case 'equip':
                itemActions[i].addEventListener('click', () => {
                    equipItem(currentActingPlayer, clickedItem)
                })
            break;
            case 'drop':
                itemActions[i].addEventListener('click', () => {
                    dropItem(currentActingPlayer, clickedItem)
                })
            break;
            case 'give':
                itemActions[i].addEventListener('click', () => {
                    giveItem(currentActingPlayer, clickedItem)
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

    // Check item type
    if(clickedItem.type === 3 || clickedItem.type === 4){
        // If the item is a weapon or armor
        const { equip, attributes } = currentActingPlayer

        const equipped = Object.entries(equip).findIndex(e => e.id === clickedItem.id)

        // Hide or display options
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
        // Calculate attribute changes if equip
        // If is the same item
        const sameItem = Object.values(equip).findIndex(e => e.id === clickedItem.id)

        for(let [key, value] of Object.entries(clickedItem.effect.base_attribute)){
            if(sameItem < 0){
                let attributeChanges = dp
                const itemToChange = Object.values(equip).find(e => e.id === clickedItem.id)

                const itemData = (clickedItem.type === 3)? weapon.getOne(itemToChange.id) : armor.getOne(itemToChange.id)

                if(itemData?.effect?.base_attribute[key]){
                    attributeChanges = (attributes[key] - itemData.effect.base_attribute[key]) + clickedItem.effect.base_attribute[key] 

                    const attributeTag = `<div style="color:${(attributeChanges > currentActingPlayer.attributes[key])? 'green' : 'red'}">${key} ${attributeChanges}</div>`

                    desc.children[1].insertAdjacentHTML('beforeend', attributeTag)
                }
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
 */
const useItem = async(currentActingPlayer, clickedItem) => {

    if(Object.entries(clickedItem).length){
        const { effect } = clickedItem
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

        // If the quantity of the item is greater than 1 
        if(currentActingPlayer.bag[selectedItem.index].amount > 1){
            currentActingPlayer.bag[selectedItem.index].amount -= 1
        }else{
            // Remove the item from the inventory
            currentActingPlayer.bag.splice(selectedItem.index, 1)
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
        // Leave an item on the ground, need an sprite to draw on the tile    
        setEvent({x: currentActingPlayer.x, y: currentActingPlayer.y}, [{id: currentActingPlayer.bag[selectedItem.index].id, amount: 1}])

        // Alter item amount or remove item
        if(currentActingPlayer.bag[selectedItem.index].amount > 1){
            currentActingPlayer.bag[selectedItem.index].amount -= 1
        }else{
            const items = document.querySelectorAll('.item')
            currentActingPlayer.bag.splice(selectedItem.index, 1)
            items[selectedItem.index].remove()
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
    const desc = document.getElementById('item-desc')
    // const itemToolTips = document.querySelectorAll('.item-toolTip')

    const fontSize = Math.floor( 10 * Math.floor(canvasPosition.width / 100))

    // Set the size of each block
    desc.children[0].style.width = (canvasPosition.width / 9) + 'px'
    desc.children[0].style.height = (canvasPosition.width / 9) + 'px'
    desc.children[1].style.whiteSpace = "pre-line"

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
    const filterButton = document.querySelectorAll('.filter')
    const desc = document.getElementById('item-desc')

    const fontSize = Math.floor( 10 * Math.floor(canvasPosition.width / 100))
    // Set the size of each block
    desc.children[0].style.width = currentActingPlayer.tileSize + 'px'
    desc.children[0].style.height = currentActingPlayer.tileSize + 'px'
    desc.children[1].style.whiteSpace = "pre-line"

    const itemBlockSize = Math.floor(canvasPosition.width / 100) * 30
    const itemBlockMargin = Math.floor((itemBlockSize / 100) * 10)

    filterButton.forEach(f => {
        f.style.fontSize = Math.floor(fontSize / 3) + 'px'
        f.style.width = `${canvasPosition.width * 0.1}px`
        f.style.height = `${canvasPosition.width * 0.1}px`
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

        item.setAttribute('data-id', itemData.id)
        item.setAttribute('data-type', itemData.type)
        item.setAttribute('data-limit', itemData.stackLimit)
        item.setAttribute('data-index', i)
        item.setAttribute('data-long-press-delay', 500)

        // itemToolTip.classList.add('item-toolTip')
        // itemToolTip.append(attributeTag)
        // itemToolTip.append(valueTage)

        // Set long-press event
        item.addEventListener('long-press', () => {
            selectedItem = itemData
            selectedItem['index'] = i
            openItemSubMenu( currentActingPlayer, itemData)
        })

        // Set click event
        // item.addEventListener('click', (e) => {
        //     selectedItem = itemData
        //     selectedItem['index'] = i
        //     showItemToolTip(currentActingPlayer, itemData)
        // })

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
        // item.append(itemToolTip)
        item.append(itemCount)
        space.append(item)
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
