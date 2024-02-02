import weapon from "../dataBase/item/item_weapon"
import armor from "../dataBase/item/item_armor"
import setting from "./setting"

import { characterAnimationPhaseEnded } from "../game"

// Player level up if the exp reached the required amount
const levelUp = (player) => {
    // Player level up
    player.lv += 1
    // Extend the required exp for the next level
    player.requiredExp += player.requiredExp * 1.5

    // Give player a few points to spend
    player.pt = 5

    const grows = [0, 1, 3]

    // A list of attributes that are allow to growth on level up
    const attributeList = ['maxHp', 'maxMp', 'str', 'def', 'spd', 'int', 'lck', 'spi']

    console.log('player status before level up :>>>', player.attributes)

    // Randomly apply attributes growth
    for(let attr of attributeList){
        console.log('key :>>>', attr)
        const allowIndex = attributeList.findIndex(a => a === attr)
        const preferIndex = player.prefer_attributes.findIndex(a => attr.includes(a))
        if(allowIndex >= 0){
            const randomGrowth = Math.floor(Math.random() * (grows.length -1))
            player.attributes[attr] += grows[randomGrowth]
        }

        // Guarantee attribute growth
        if(preferIndex >= 0){
            player.attributes[attr] += 1
        }
    }

    characterAnimationPhaseEnded(player)
    console.log('player status after level up :>>>', player.attributes)
}

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
    let hitRate = player.attributes.spd + player.attributes.lck + damage
    let evadeRate = enemy.attributes.spd + enemy.attributes.def
    let critRate =  player.attributes.lck * player.attributes.int
    let statusRate = (status !== null)? player.attributes.lck + (player.attributes.lck * Math.floor(player.attributes.lck / 100)) : 0

    let LvDistance = 0, totalRate = 0
    let resultMessage = '', resultStyle = 'yellow'

    if(player.lv >= enemy.lv){
        LvDistance = player.lv - enemy.lv
        hitRate = hitRate + Math.floor(hitRate * (LvDistance/100))
    }else{
        LvDistance = enemy.lv - player.lv
        hitRate = Math.abs(hitRate - Math.floor(hitRate * (LvDistance/100)))
    }

    totalRate = hitRate + evadeRate

    const hitRates = [ { name: 'hitRate', value: hitRate }, { name: 'evadeRate', value: evadeRate } ]

    const firstDiceRoll = await diceRoll(hitRates, totalRate)

    console.log('Hit rates :>>>', hitRates)
    console.log('totalRate :>>>', totalRate)
    console.log('First dice roll :>>>', firstDiceRoll)

    if(firstDiceRoll.name === 'hitRate'){
        // Check if crit
        totalRate = hitRate + critRate

        const critRates = [ { name: 'hitRate', value: hitRate }, { name: 'critRate', value: critRate} ]
    
        const secondDiceRoll = await diceRoll(critRates, totalRate)
    
        console.log('Crit rates :>>>', critRates)
        console.log('totalRate :>>>', totalRate)
        console.log('Second dice roll :>>>', secondDiceRoll)

        if(secondDiceRoll.name === 'critRate'){
            console.log('crit!')
            const criticalHit = Math.round(damage * 1.5)
            resultMessage = String(criticalHit)
            resultStyle = 'orange'
            enemy.attributes.hp -= criticalHit
            console.log('enmey hp:>>>', enemy.attributes.hp)
        }else{
            console.log('hit!')
            resultMessage = String(damage)
            enemy.attributes.hp -= damage
            console.log('enmey hp:>>>', enemy.attributes.hp)
        }

        if(statusRate > 0){
            totalRate = statusRate + evadeRate
            const statusRates = [ { name: 'statusRate', value: statusRate}, { name: 'evadeRate', value: evadeRate } ]

            const thirdDiceRoll = await diceRoll(statusRates, totalRate)

            if(thirdDiceRoll.name !== 'evadeRate'){
                console.log('Change status')
                enemy.attributes.status = effect.status
                resultMessage += `,${effect.status}`
            }
        }
    }else{
        console.log('miss!')
        resultMessage = 'MISS!'
    }

    return { resultMessage, resultStyle }
}

const calculateEnemyMagicDefense = (enemy) => {
    let defense = 0

    for(let[key, value] of Object.entries(enemy.equip)){
        if(enemy.equip[key]?.id !== undefined){
            const itemData = armor.getOne(enemy.equip[key].id)

            if(itemData && itemData.effect.base_attribute?.spi !== undefined){
                defense += Math.floor(enemy.attributes.spi * ( itemData.effect.base_attribute.spi/100 ))
            }
        }
    }

    if(defense === 0){
        defense = enemy.attributes.spi + Math.floor(enemy.attributes.spi * (1/100))
    }else{
        defense += enemy.attributes.spi
    }

    return defense
}

// Calculate enemy defense value
const calculateEnemyDefense = (enemy) => {
    let defense = 0

    for(let[key, value] of Object.entries(enemy.equip)){
        if(enemy.equip[key]?.id !== undefined){
            const itemData = armor.getOne(enemy.equip[key].id)

            if(itemData && itemData.effect.base_attribute?.def !== undefined){
                defense += Math.floor(enemy.attributes.def * ( itemData.effect.base_attribute.def/100 ))
            }
        }
    }

    if(defense === 0){
        defense = enemy.attributes.def + Math.floor(enemy.attributes.def * (1/100))
    }else{
        defense += enemy.attributes.def
    }

    return defense
}

const calculatePossibleDamage = (player, enemyDefense, base_on_attribute, base_number, multiply_as) => {
    const dmgRange = []
    let damage = 1 // Min dmg
    // Calculare weapon and attribute bonus
    if(player.equip?.hand?.id !== undefined){
        const itemData = weapon.getOne(player.equip.hand.id)      

        // Need something to know if the attck is enhanced by skill or not
        let minDmg = ((player.attributes[base_on_attribute] + Math.floor(player.attributes[base_on_attribute] * ( itemData.effect.base_attribute[base_on_attribute]/100 ))) - enemyDefense ) + itemData.effect.base_damage.min

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
        let minDmg = (player.attributes[base_on_attribute] - enemyDefense) + 1

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
 * 
 * @param {object} player - An object contains player attributes 
 * @param {object} enemy - An object contains enemy attributes 
 * @returns 
 */
export const weaponAttack = async(player, enemy) => {
    const dmgRange = []
    let damage = 1 // Min dmg
    const enemyDefense = calculateEnemyDefense(enemy)

    console.log('enemy defense :>>>', enemyDefense)

    // Calulate damage with weapon
    if(player.equip?.hand?.id !== undefined){
        const itemData = weapon.getOne(player.equip.hand.id)

        // Need something to know if the attck is enhanced by skill or not
        let minDmg = ((player.attributes.str + Math.floor(player.attributes.str * ( itemData.effect.base_attribute.str/100 ))) - enemyDefense) + itemData.effect.base_damage.min

        if(minDmg <= 0) minDmg = 1

        const maxDmg = minDmg + (itemData.effect.base_damage.max - itemData.effect.base_damage.min)

        for(let i = minDmg; i <= maxDmg; i++){
            dmgRange.push(i)
        }

        damage = dmgRange[Math.floor(Math.random() * dmgRange.length)]        
    }else{
        // Calulate damage without weapon
        // Need something to know if the attck is base on skill or not
        let minDmg = (player.attributes.str - enemyDefense) + 1

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
                const enemyDefense = (skill.type === 'dmg')? calculateEnemyDefense(enemy) : calculateEnemyMagicDefense(enemy)

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
            damage += Math.floor(enemy.attributes[base_on_attribute] * (base_number / 100))
        }
    }

    console.log('possible damage :>>>', damage)

    return await calculateHitRate(player, enemy, damage)
}

// Player gain expirence upon enemy defeated
export const gainExp = (player, enemy) => {
    // Remove the enemy on the screen
    if(player.exp !== undefined){
        player.exp += enemy.givenExp

        if(player.exp >= player.requiredExp){
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
                    levelUp(player)

                    setTimeout(() => message.remove(), 500)
                }, 500)                
            }, 500)

        }else{
            characterAnimationPhaseEnded(player)
        }   
    }
}
