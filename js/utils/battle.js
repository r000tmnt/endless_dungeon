import { setEvent } from "../game"

import weapon from "../dataBase/item/item_weapon"

// Player gain expirence upon enemy defeated
const gainExp = (player, enemy) => {
    // Remove the enemy on the screen
    if(player.exp !== undefined){
        player.exp += enemy.givenExp

        if(player.exp >= player.requiredExp){
            levelUp(player)
        }        
    }
}

// Player level up if the exp reached the required amount
const levelUp = (player) => {
    // Player level up
    // Extend the required exp for the next level
    player.requiredExp += player.requiredExp * 1.5

    // Give player a few points to spend
    player.pt = 5

    const grows = [0, 1, 3, 5,]

    // A list of attributes that are allow to growth on level up
    const attributeList = ['maxHp', 'maxMp', 'str', 'def', 'spd', 'int', 'lck']

    console.log('player status before level up :>>>', player)

    // Randomly apply attributes growth
    for(let key in Object.entries(player.attributes)){
        const allowIndex = attributeList.findIndex(a => a === key)

        if(allowIndex >= 0){
            const randomGrowth = Math.floor(Math.random() * (grows.length -1))
            player.attribute[key] += grows[randomGrowth]
        }
    }

    console.log('player status after level up :>>>', player)
}

const calculateHitRate = (player, enemy, damage, tileMap, row, col) => {
    let hitRate = player.attributes.spd + player.attributes.lck + damage
    let evadeRate = enemy.attributes.spd + enemy.attributes.def
    let critRate =  player.attributes.lck * player.attributes.int

    let LvDistance = 0, totalRate = 0
    let resultMessage = ''

    if(player.lv >= enemy.lv){
        LvDistance = player.lv - enemy.lv
        hitRate = hitRate + Math.floor(hitRate * (LvDistance/100))
    }else{
        LvDistance = enemy.lv - player.lv
        hitRate = Math.abs(hitRate - Math.floor(hitRate * (LvDistance/100)))
    }

    totalRate = hitRate + evadeRate

    const hitRates = [ { name: 'hitRate', value: hitRate }, { name: 'evadeRate', value: evadeRate } ]

    for(let i=0; i < hitRates.length; i++){
        hitRates[i].value = hitRates[i].value / totalRate
    }

    // Sort in ascending order for accuracy
    hitRates.sort((a, b) => a.value - b.value)

    const firstDiceRoll = hitRates[Math.floor(Math.random() * hitRates.length)]

    console.log('Hit rates :>>>', hitRates)
    console.log('totalRate :>>>', totalRate)
    console.log('First dice roll :>>>', firstDiceRoll)

    if(firstDiceRoll.name === 'hitRate'){
        // Check if crit
        totalRate = hitRate + critRate

        const critRates = [ { name: 'hitRate', value: hitRate }, { name: 'critRate', value: critRate} ]
    
        for(let i=0; i < critRates.length; i++){
            critRates[i].value = critRates[i].value / totalRate
        }
    
        // Sort in ascending order for accuracy
        critRates.sort((a, b) => a.value - b.value)
    
        const secondDiceRoll = critRates[Math.floor(Math.random() * hitRates.length)]
    
        console.log('Crit rates :>>>', critRates)
        console.log('totalRate :>>>', totalRate)
        console.log('Second dice roll :>>>', secondDiceRoll)

        if(secondDiceRoll.name === 'critRate'){
            console.log('crit!')
            const criticalHit = Math.round(damage * 1.5)
            resultMessage = String(criticalHit)
            enemy.attributes.hp -= criticalHit
            console.log('enmey hp:>>>', enemy.attributes.hp)
        }else{
            console.log('hit!')
            resultMessage = String(damage)
            enemy.attributes.hp -= damage
            console.log('enmey hp:>>>', enemy.attributes.hp)
        }
    }else{
        console.log('miss!')
        resultMessage = 'MISS!'
    }

    // Check if the enemy is defeated
    if(enemy.attributes.hp <= 0){
        tileMap.removeCharacter(row, col)

        gainExp(player, enemy)

        // Leave the item on the ground
        setEvent({x: enemy.x, y: enemy.y}, enemy.drop)
    }

    return resultMessage
}

/**
 * 
 * @param {object} player - An object contains player attributes 
 * @param {object} enemy - An object contains enemy attributes 
 * @returns 
 */
export const weaponAttack = async(player, enemy, tileMap, row, col) => {
    const dmgRange = []
    let damage = 1 // Min dmg

    // Calulate damage with weapon
    if(player.equip.hand?.id !== undefined){
        const itemData = weapon.getOne(player.equip.hand.id)

        // Need something to know if the attck is enhanced by skill or not
        const minDmg = ((player.attributes.str + Math.floor(player.attributes.str * ( itemData.effect.base_attribute.str/100 ))) - (enemy.attributes.def  + Math.floor(enemy.attributes.def * ( 1/100 )))) + itemData.effect.base_damage.min

        const maxDmg = minDmg + (itemData.effect.base_damage.max - itemData.effect.base_damage.min)

        for(let i = minDmg; i <= maxDmg; i++){
            dmgRange.push(i)
        }

        damage = dmgRange[Math.floor(Math.random() * dmgRange.length)]        
    }else{
        // Calulate damage without weapon
        // Need something to know if the attck is base on skill or not
        const minDmg = (player.attributes.str - (enemy.attributes.def  + Math.floor(enemy.attributes.def * ( 1/100 )))) + 1

        const maxDmg = minDmg + 2

        for(let i = minDmg; i <= maxDmg; i++){
            dmgRange.push(i)
        }

        damage = dmgRange[Math.floor(Math.random() * dmgRange.length)]  
    }
    
    console.log('dmgRange :>>>', dmgRange)
    console.log('possible damage :>>>', damage)

    return calculateHitRate(player, enemy, damage, tileMap, row, col)
}

export const skillAttack = async(skill, player, enemy, tileMap, row, col) => {
    const dmgRange = []
    let damage = 1 // Min dmg

    const { base_on_attribute, multiply_as, base_dmg } = skill.effect

    // Calculare weapon and attribute bonus
    const itemData = weapon.getOne(player.equip.hand.id)      

    // Need something to know if the attck is enhanced by skill or not
    let minDmg = ((player.attributes[base_on_attribute] + Math.floor(player.attributes.str * ( itemData.effect.base_attribute[base_on_attribute]/100 ))) - (enemy.attributes.def  + Math.floor(enemy.attributes.def * ( 1/100 )))) + itemData.effect.base_damage.min

    if(multiply_as === 'solid'){
        minDmg += base_dmg
    }else{
        minDmg += Math.floor(minDmg * (base_dmg / 100))
    }

    const maxDmg = minDmg + (itemData.effect.base_damage.max - itemData.effect.base_damage.min)

    for(let i = minDmg; i <= maxDmg; i++){
        dmgRange.push(i)
    }

    damage = dmgRange[Math.floor(Math.random() * dmgRange.length)] 

    console.log('dmgRange :>>>', dmgRange)
    console.log('possible damage :>>>', damage)

    return calculateHitRate(player, enemy, damage, tileMap, row, col)
}
