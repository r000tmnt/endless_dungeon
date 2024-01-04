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

const openItemSubManu = (currentActingPlayer, index) =>{
    const subMenu = document.getElementById('itemAction')
    const desc = document.getElementById('item-desc')

    const itemIcon = document.createElement('img')

    itemInfo.style.whiteSpace = "pre-line"
    desc.children[1].innerText = `${currentActingPlayer.bag[index].name}\n currentActingPlayer.bag[index].name`
}

const useItem = () => {}

const equipItem = () => {}

const dropItem = (currentActingPlayer, index) => {
    if(currentActingPlayer.bag[index].amount > 1){
        currentActingPlayer.bag[index].amount -= 1
    }else{
        currentActingPlayer.bag.splice(index, 1)
    }
}

export const constructInventoryWindow = async(currentActingPlayer, canvasPosition) => {
    const Inventory = document.getElementById('item')
    const space = document.getElementById('inventory')
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
                    item.setAttribute('data-id', items[j].id)
                    item.setAttribute('data-type', items[j].type)
                    item.setAttribute('data-limit', items[j].stackLimit)
                    item.setAttribute('data-index', i)

                    // Set click event
                    item.addEventListener('click', () => openItemSubManu(currentActingPlayer, i))

                    // Set hover event
                    item.addEventListener('hover', () => showItemToolTip(items[j].effect.desc))

                    item.innerText = items[j].name
                    itemCount.innerText = currentActingPlayer.bag[i].amount
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
            Inventory.classList.add('open_window')
        } catch (error) {
            console.log(error)
            return error
        }
    }
}
