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

/**
 * 
 * @param {object} player - An object contains player attributes 
 * @param {object} enemy - An object contains enemy attributes 
 * @returns 
 */
export const weaponAttack = async(player, enemy, tileMap, row, col) => {
    // Calculate damage and probability
    let LvDistance = 0

    const Rates = [
        {
            name: 'hitRate',
            value: 0
        },
        {
            name: 'evadeRate',
            value: enemy.attributes.spd + enemy.attributes.def
        },
        {
            name: 'criticalRate',
            value: player.attributes.lck
        }
    ]

    // Need something to know if the attck is base on skill or not
    const damage = (player.attributes.str + Math.floor(player.attributes.str * ( 1/100 ))) - (enemy.attributes.def  + Math.floor(enemy.attributes.def * ( 1/100 )))

    console.log('possible damage :>>>', damage)

    if(player.lv >= enemy.lv){
        LvDistance = player.lv - enemy.lv
        Rates[0].value = player.attributes.spd + player.attributes.lck + damage + Math.floor(LvDistance/100) + 100
    }else{
        LvDistance = enemy.lv - player.lv
        Rates[0].value = Math.abs(LvDistance -(player.attributes.spd + damage) + Math.floor(LvDistance/100))
    }

    const totalRate = Rates.reduce((accu, current) => accu + current.value, 0)

    console.log('Initial rate :>>>', Rates)
    console.log('totalRate :>>>', totalRate)

    for(let i=0; i < Rates.length; i++){
        Rates[i].value = Rates[i].value / totalRate
    }

    // Sort in ascending order for accuracy
    Rates.sort((a, b) => a.value - b.value)

    console.log('Final rate :>>>', Rates)

    const random = Math.random()

    let resultMessage = ''

    for(let i=0; i < Rates.length; i++){
        console.log('random :>>>', random)
        if(random <= Rates[i].value){
            switch(Rates[i].name){
                case 'hitRate':
                    console.log('hit!')
                    resultMessage = String(damage)
                    enemy.attributes.hp -= damage
                    console.log('enmey hp:>>>', enemy.attributes.hp)
                break;
                case 'evadeRate':
                    console.log('miss!')
                    resultMessage = 'MISS!'
                break;
                case 'criticalRate':
                    console.log('crit!')
                    const criticalHit = Math.round(damage * 1.5)
                    resultMessage = String(criticalHit)
                    enemy.attributes.hp -= criticalHit
                    console.log('enmey hp:>>>', enemy.attributes.hp)
                break;
            }
            // Check if the enemy is defeated
            if(enemy.attributes.hp <= 0){
                tileMap.removeCharacter(row, col)

                gainExp(player, enemy)
            }
            // Stop for loop
            break;
        // If loop to the late one and still miss anything
        }else if(i === (Rates.length - 1)){
            console.log('nothing!')
            resultMessage = 'MISS!'
        }
    }

    return resultMessage

    // resultMessage 

    // characterCaption.classList.add('invisible') 
    // actionMenu.classList.remove('action_menu_open') 
    // playerAttackRange.splice(0)

    // const { message, style, size} = messageConfig

    // displayMessage(message, size, style,  enemy.x, (enemy.y - tileSize))
}