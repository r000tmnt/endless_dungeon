import weapon from "../dataBase/item/item_weapon"
import armor from "../dataBase/item/item_armor"
import setting from "./setting"
import game from "../game"
import Audio from "../audio"

// Possible value for attribute growth
const grows = [0, 1, 3]

// A list of attributes that are allow to growth on level up
const attributeList = ['maxHp', 'maxMp', 'str', 'def', 'spd', 'int', 'lck', 'spi']

const diceRoll = async(hitRates, totalRate) => {
    for(let i=0; i < hitRates.length; i++){
        hitRates[i].value = hitRates[i].value / totalRate
    }

    // Sort in ascending order for accuracy
    hitRates.sort((a, b) => a.value - b.value)

    const diceRoll = Math.random()
    let result = {name: '', value: ''}

    for(let i=0; i < hitRates.length; i++){
        if(diceRoll <= hitRates[i].value){
            result = hitRates[i]
            break
        }
    }

    return result
} 

// Calculate Hit rate and Crit rate
const calculateHitRate = async(player, enemy, damage, status = null) => {
    let hitRate = player.totalAttribute.spd + player.totalAttribute.lck + damage
    let evadeRate = enemy.totalAttribute.spd + enemy.totalAttribute.def
    let critRate =  player.totalAttribute.lck * player.totalAttribute.int
    let statusRate = (status !== null)? player.totalAttribute.lck + (player.totalAttribute.lck * Math.floor(player.totalAttribute.lck / 100)) : 0

    let LvDistance = 0, totalRate = 0
    let resultMessage = '', resultStyle = 'yellow'

    if(player.lv >= enemy.lv){
        LvDistance = player.lv - enemy.lv
        hitRate = hitRate + Math.floor(hitRate * (LvDistance/100))
    }else{
        LvDistance = enemy.lv - player.lv
        hitRate = Math.abs(hitRate - Math.floor(hitRate * (LvDistance/100)))
    }

    // Check if there's other thing that can alter the hit rate, such as skill or item
    // Evade is greater then Hit
    if(enemy.status.findIndex(s => s.name === 'Evade') >= 0){
        hitRate = 0
        evadeRate = 100

        // remove the enhanced status
        enemy.removeStatus('Evade')
    }else{
        if(player.status.length){
            switch(true){
                case player.status.findIndex(s => s.name === 'Hit') >= 0:
                    hitRate = 100
                    evadeRate = 0

                    // remove the enhancd status
                    player.removeStatus('Hit')
                break;
                case player.status.findIndex(s => s.name === 'Focus') >= 0:
                    hitRate += Math.floor(hitRate * 0.3)
                    evadeRate -= Math.floor(evadeRate * 0.3 )

                    // focus will last a whole turn
                break;
                case enemy.status.findIndex(s => s.name === 'Focus') >= 0:
                    hitRate -= Math.floor(hitRate * 0.3)
                    evadeRate += Math.floor(evadeRate * 0.3 )

                    // focus will last a whole turn
                break;
            }            
        }
    }

    totalRate = hitRate + evadeRate

    const hitRates = [ { name: 'hitRate', value: hitRate }, { name: 'evadeRate', value: evadeRate } ]

    const firstDiceRoll = await diceRoll(hitRates, totalRate)

    console.log('Hit rates :>>>', hitRates)
    console.log('totalRate :>>>', totalRate)
    console.log('First dice roll :>>>', firstDiceRoll)

    if(firstDiceRoll.name === 'hitRate'){
        // Check if crit
        if(player.status.find(s => s.name ==='crit')){
            critRate = 100
            hitRate = 0

            // remove the enhanced status
            player.removeStatus('crit')
        }

        totalRate = hitRate + critRate

        const critRates = [ { name: 'hitRate', value: hitRate }, { name: 'critRate', value: critRate} ]
    
        const secondDiceRoll = await diceRoll(critRates, totalRate)
    
        console.log('Crit rates :>>>', critRates)
        console.log('totalRate :>>>', totalRate)
        console.log('Second dice roll :>>>', secondDiceRoll)

        if(player.equip?.hand?.id !== undefined){
            switch(true){
                case player.equip.hand.id.includes('knife'):
                    if(player.attackSound === null){
                        player.attackSound = new Audio(`${__BASE_URL__}assets/audio/knife_stab.mp3`, 'attack')
                    }else{
                        player.attackSound.element.src = `${__BASE_URL__}assets/audio/knife_stab.mp3`
                    }

                    player.attackSound.element.play()
                break;
            }            
        }else{
            player.attackSound.element.play()
        }


        if(secondDiceRoll.name === 'critRate'){
            console.log('crit!')
            setTimeout(() => {
                enemy.animation = 'damage'
            }, 300)
            const criticalHit = Math.round(damage * 1.5)
            resultMessage = String(criticalHit)
            resultStyle = 'orange'
            enemy.totalAttribute.hp -= criticalHit
            console.log('enmey hp:>>>', enemy.totalAttribute.hp)
        }else{
            console.log('hit!')
            setTimeout(() => {
                enemy.animation = 'damage'
            }, 300)
            resultMessage = String(damage)
            enemy.totalAttribute.hp -= damage
            console.log('enmey hp:>>>', enemy.totalAttribute.hp)
        }

        if(statusRate > 0){
            totalRate = statusRate + evadeRate
            const statusRates = [ { name: 'statusRate', value: statusRate}, { name: 'evadeRate', value: evadeRate } ]

            const thirdDiceRoll = await diceRoll(statusRates, totalRate)

            if(thirdDiceRoll.name !== 'evadeRate'){
                console.log('Change status')
                enemy.status = effect.status
                resultMessage += `,${effect.status}`
            }
        }
    }else{
        console.log('miss!')
        game.missSound.element.play()
        resultMessage = 'MISS!'
    }

    return { resultMessage, resultStyle }
}

// Calculate enemy defense value
const calculateEnemyDefense = (enemy, type) => {
    const attribute = (type === 'damage')? "def" : "spi"

    let defense = 0

    for(let[key, value] of Object.entries(enemy.equip)){
        if(enemy.equip[key]?.id !== undefined){
            const itemData = armor.getOne(enemy.equip[key].id)

            if(itemData && itemData.effect.base_attribute[attribute] !== undefined){
                defense += Math.floor(enemy.totalAttribute[attribute] * ( itemData.effect.base_attribute.def/100 ))
            }
        }
    }

    if(defense === 0){
        defense = enemy.totalAttribute[attribute] + Math.floor(enemy.totalAttribute[attribute] * (1/100))
    }else{
        defense += enemy.totalAttribute[attribute]
    }

    return defense
}

const calculatePossibleDamage = (player, enemyDefense, base_on_attribute, base_number, multiply_as) => {
    const dmgRange = []
    let damage = 1 // Min dmg
    const attribute = player.totalAttribute[base_on_attribute]
    // Calculare weapon and attribute bonus
    if(player.equip?.hand?.id !== undefined){
        const itemData = weapon.getOne(player.equip.hand.id)      

        // Need something to know if the attck is enhanced by skill or not
        let minDmg = ((attribute + Math.floor(attribute * ( itemData.effect.base_attribute[base_on_attribute]/100 ))) - enemyDefense ) + itemData.effect.base_damage.min

        if(multiply_as === 'solid'){
            minDmg += base_number
        }else{
            minDmg += Math.floor(minDmg * (base_number / 100))
        }

        const maxDmg = minDmg + (itemData.effect.base_damage.max - itemData.effect.base_damage.min)

        for(let i = minDmg; i <= maxDmg; i++){
            dmgRange.push(i)
        }

        damage = dmgRange[Math.floor(Math.random() * dmgRange.length)]         
    }else{
        // Without weapon
        // Need something to know if the attck is enhanced by skill or not
        let minDmg = (attribute - enemyDefense) + 1

        if(minDmg <= 0) minDmg = 1

        const maxDmg = minDmg + 2

        for(let i = minDmg; i <= maxDmg; i++){
            dmgRange.push(i)
        }

        damage = dmgRange[Math.floor(Math.random() * dmgRange.length)]    
    }
    console.log('dmgRange :>>>', dmgRange)
    return damage
}

/**
 * Calculate the possible damage of the attack
 * @param {object} player - An object contains player attributes 
 * @param {object} enemy - An object contains enemy attributes 
 * @returns 
 */
export const weaponAttack = async(player, enemy) => {
    const dmgRange = []
    let damage = 1 // Min dmg

    // Calulate damage with weapon
    if(player.equip?.hand?.id !== undefined){
        const itemData = weapon.getOne(player.equip.hand.id)

        const enemyDefense = calculateEnemyDefense(enemy, (itemData.effect.base_attribute.str)? 'damage' : 'magic')
        console.log('enemy defense :>>>', enemyDefense)

        const attr = (itemData.effect.base_attribute.str)? "str" : "int"

        // Need something to know if the attck is enhanced by skill or not
        let minDmg = ((player.totalAttribute[attr] + Math.floor(player.totalAttribute[attr] * ( itemData.effect.base_attribute[attr]/100 ))) - enemyDefense) + itemData.effect.base_damage.min

        if(minDmg <= 0) minDmg = 1

        const maxDmg = minDmg + (itemData.effect.base_damage.max - itemData.effect.base_damage.min)

        for(let i = minDmg; i <= maxDmg; i++){
            dmgRange.push(i)
        }

        damage = dmgRange[Math.floor(Math.random() * dmgRange.length)]        
    }else{
        // Calulate damage without weapon
        // Need something to know if the attck is base on skill or not
        const enemyDefense = calculateEnemyDefense(enemy, 'damage')
        console.log('enemy defense :>>>', enemyDefense)

        let minDmg = (player.totalAttribute.str - enemyDefense) + 1

        if(minDmg <= 0) minDmg = 1

        const maxDmg = minDmg + 2

        for(let i = minDmg; i <= maxDmg; i++){
            dmgRange.push(i)
        }

        damage = dmgRange[Math.floor(Math.random() * dmgRange.length)]  
    }
    
    console.log('dmgRange :>>>', dmgRange)
    console.log('possible damage :>>>', damage)

    return calculateHitRate(player, enemy, damage)
}

export const skillAttack = async(skill, player, enemy) => {
    let damage = 1 // Min dmg

    const { base_on_attribute, multiply_as, base_number, type } = skill.effect

    if(skill.type === 'offence'){
        switch(type){
            case 'dmg': case 'magic':{
                const enemyDefense = calculateEnemyDefense(enemy, skill.type)

                damage = calculatePossibleDamage(player, enemyDefense, base_on_attribute, base_number, multiply_as)
            }
            break;
            case 'status':{
                const enemyDefense = calculateEnemyDefense(enemy)

                damage = calculatePossibleDamage(player, enemyDefense, base_on_attribute, base_number, multiply_as)
            }
            break;
        }        
    }else{
        // Support skill
        if(multiply_as === 'solid'){
            damage = base_number
        }

        if(multiply_as === 'percentage'){
            damage += Math.floor(enemy.totalAttribute[base_on_attribute] * (base_number / 100))
        }
    }

    console.log('possible damage :>>>', damage)

    return await calculateHitRate(player, enemy, damage)
}

// Player level up if the exp reached the required amount
export const levelUp = (player) => {
    // Play sound effect
    game.levelUpSound.element.play()

    // Prepare level up message
    const { fontSize, fontSize_sm } = setting.general
    const appWrapper = document.getElementById('wrapper')
    const message = document.createElement('span')
    message.classList.add('absolute')
    message.style.opacity = 0
    message.style.fontSize = fontSize + 'px'
    message.style.fontWeight = 'bold'
    message.style.padding = fontSize_sm + 'px'
    message.style.color = 'white'
    message.style.backgrounf = 'black'
    message.style.top = player.y + 'px'
    message.style.left = player.x + 'px'
    message.style.transition = 'all .5s ease-in-out'
    message.innerText = 'LEVEL UP'
    appWrapper.append(message)

    // Display level up message
    setTimeout(() => {
        message.style.opacity = 1
        message.style.top = (player.y - fontSize) + 'px'

        // Delete level up message
        setTimeout(() => {
            message.style.opacity = 0
            message.style.top = (player.y - (fontSize * 2)) + 'px'
            
            setTimeout(() => {
                message.remove()
            
                // Player level up
                player.lv += 1
                // Extend the required exp for the next level
                player.requiredExp += player.requiredExp * 1.5

                // Give player a few points to spend
                player.pt = 5

                console.log('player status before level up :>>>', player.totalAttribute)

                // Guarantee attribute growth
                player.prefer_attributes.forEach(attr => {
                    player.totalAttribute[attr] += 1
                });

                // Randomly apply attributes growth
                for(let attr of attributeList){
                    console.log('key :>>>', attr)

                    const randomGrowth = Math.floor(Math.random() * (grows.length -1))
                    player.totalAttribute[attr] += grows[randomGrowth]
                }

                // Check if exp is enough to level up the character again
                if(player.exp >= player.requiredExp){
                    levelUp(player)
                }else{
                    game.characterAnimationPhaseEnded(player)
                    console.log('player status after level up :>>>', player.totalAttribute)        
                }            
            }, 500)
        }, 500)                
    }, 500)
}

// Player gain expirence upon enemy defeated
export const gainExp = (player, enemy) => {
    // Remove the enemy on the screen
    if(player.exp !== undefined){
        player.exp += enemy.givenExp

        if(player.exp >= player.requiredExp){
            levelUp(player)
        }else{
            game.characterAnimationPhaseEnded(player)
        }   
    }
}
