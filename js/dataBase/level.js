/**
 * Place the conversation event at the beginning of the event array and state the trigger value as "auto"
 * Other event like drop item or character interation are place after conversation event
 */
export default{
    data: [
        {
            "id": "p-1-1",
            "name": "Echo from the above",
            "map": [
                [1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 3, 2, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1],
            ],
            "assets": [ // define in numeric order
                "",
                "wall.png",
                "",
                "",
                "item.png"
            ],
            // conversation - 對話階段, 
            // battle - 戰鬥階段
            // intermission - 整備階段
            // end - 回到標題畫面
            "phase": [ 'conversation', 'titleCard', 'battle', 'conversation', 'end' ],
            "event": [
                // Before battle phase
                {
                    "position": [],
                    "item": [],
                    "scene": [
                        {
                            "background": "cave", // Background image
                            "audio": "cave_ambience", // Background audio
                            // Define how many person to show on screen
                            "people": 0,
                            "dialogue": [
                                {
                                    "person": "", // character potrait images file. "none" means to clear all potrait, empty string means no changes to the portrait
                                    "style": "", // color, default as white
                                    "size": "", // Default to setting fontSize, accept fontSize_md, fontSize_sm property
                                    "content": "......" // text content
                                },
                                {
                                    "person": "",
                                    "style": "",
                                    "size": "",
                                    "content": "You feel quite a headache, like you've been hit by a boulder or somthing."
                                },
                                {
                                    "person": "",
                                    "style": "", 
                                    "size": "", 
                                    "content": "As you gradually regain your conscious.\nYou first...",
                                },
                                {
                                    "person": "",
                                    "option": [
                                        {
                                            "value": "Take a look around",                                            "style": "",
                                            "size": "",
                                            "content": "Although there's not much light in here, you've notice that you're in a cave.",
                                            "effect": []
                                        },
                                        {
                                            "value": "Lay down on the ground",
                                            "style": "",
                                            "size": "",
                                            "content": "You slowly bend down your body against the ground.\nThen you realize that your cloth is in a poor condition,\nnot enough to protect you from the low temperature",
                                            "effect": [
                                                {
                                                    "target": "player_1", // Default to the first player created
                                                    "attribute": "hp",
                                                    "value": -1,
                                                }
                                            ]
                                        }
                                    ],
                                },
                                {
                                    "person": "",
                                    "style": "",
                                    "size": "",
                                    "content": "You heard a voice whispering beyond the entrence.\nIt is not clear enough for anyone to understand. But it gives you a direction to follow."
                                },
                                {
                                    "person": "",
                                    "style": "",
                                    "size": "",
                                    "content": "As you walk your way out of the cave. You start to get used to the lack of brightness of your surrounding."
                                },
                                {
                                    "person": "",
                                    "style": "",
                                    "size": "",
                                    "content": "That voice draws you further, until you reach a widther space."
                                },
                            ]
                        },
                        {
                            "background": "cave",
                            "audio": "cave_ambience",
                            "people": 1,
                            "dialogue": [
                                {
                                    "person": "unknow",
                                    "style": "",
                                    "size": "",
                                    "content": "Oh...you finially awake."
                                },
                                {
                                    "person": "",
                                    "style": "",
                                    "size": "",
                                    "content": "Due to the darkness, you bearly saw a silhouette of a person standing on the other side of the space."
                                },
                                {
                                    "person": "unknow",
                                    "style": "",
                                    "size": "",
                                    "content": "You should not come any closer, they will smell you."
                                },
                                {
                                    "person": "",
                                    "style": "",
                                    "size": "",
                                    "content": "Just as the mysterious person finish the words. You have take a step already."
                                },
                                {
                                    "person": "unknow",
                                    "style": "",
                                    "size": "",
                                    "content": "Shit...! What did I told you."
                                },
                                {
                                    "person": "unknow",
                                    "style": "",
                                    "size": "",
                                    "content": "You're lucky there's only one of them."
                                },
                                {
                                    "person": "unknow",
                                    "style": "",
                                    "size": "",
                                    "content": "Here, catch."
                                },
                                {
                                    "person": "none",
                                    "style": "",
                                    "size": "",
                                    "content": "The mysterious person throws a knife on the ground near where you are standing.\nWould you...",
                                },
                                {
                                    "person": "",
                                    "option": [
                                        {
                                            "value": "Take the knife",
                                            "style": "",
                                            "size": "",
                                            "content": "Soon as you pick up the knife on the ground.\nYou heard another voice, and a rotten smell came after.",
                                            "effect": [ // player equipt with the knife
                                                {
                                                    "target": "player_1",
                                                    "attribute": "equip",
                                                    "type": 3,
                                                    "value": "knife_1"
                                                }
                                            ] 
                                        },
                                        {
                                            "value": "I trust on my own fist",
                                            "style": "",
                                            "size": "",
                                            "content": "You kicked the knife out of your reach.\nYet it stops in the middle like it hit something solid, and it is not the sound of the ground or stone either.",
                                            "effect": [
                                                {
                                                    "target": "enemy_1",
                                                    "attribute": "hp",
                                                    "value": -1
                                                }   
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "person": "none",
                                    "style": "",
                                    "size": "",
                                    "content": "A sound of deadman approch towoards you."
                                },
                                {
                                    "person": "unknow",
                                    "style": "",
                                    "size": "",
                                    "content": "Suit yourself, I'm out of here"
                                }
                            ]
                        }
                    ],
                    "trigger": "auto"
                },
                // After battle phase
                {
                    "position": [],
                    "item": [],
                    "scene": [
                        {
                            "background": "cave",
                            "people": 0,
                            "dialogue": [
                                {
                                    "person": "none",
                                    "style": "",
                                    "size": "",
                                    "content": "As you defeat the monster.\nA small object made out of metal drop on the ground. It glooms, and lights up the space around it."
                                },
                                {
                                    "person": "",
                                    "style": "",
                                    "size": "",
                                    "content": "It appears to be in a shape of key. At least that's what you can think of."
                                },
                                {
                                    "person": "",
                                    "style": "",
                                    "size": "",
                                    "content": "You take a closer look at the key.\nNow it is in your possession, you feel the surge of energy lays inside it.",
                                    // "option": [
                                    //     {
                                    //         "value": "Take the key",
                                    //         "style": "",
                                    //         "size": "",
                                    //         "content": "You take a closer look at the key.\nRealize what you heard before is in fact came from the key.\nNow it is in your possession, you feel the surge of energy lays inside it.",
                                    //         "effect": [
                                    //             {
                                    //                 "target": "player_1", // Default to the first player created
                                    //                 "attribute": "item",
                                    //                 "type": 6,
                                    //                 "value": "key_dark_1"
                                    //             }
                                    //         ]
                                    //     },
                                    //     {
                                    //         "value": "Leave it",
                                    //         "style": "",
                                    //         "size": "",
                                    //         "content": "You walk away from the key.\nTowards to the edge of the space.\nIn the gloomy light, you bearly see a door-ish shape in front of you. It won't open no matter how hard you push against it.",
                                    //         "effect": []
                                    //     }
                                    // ],
                                },
                                {
                                    "person": "",
                                    "style": "",
                                    "size": "",
                                    "content": "With the lights from the key.\nYou're able to find a door in the end of the tunnel.\nAlthough you're not sure about the use of this key in your hand. You insert it into the key hole and open the door.",
                                    // Check if the key item is stored in eventEffect
                                    // "condition":{
                                    //     "match": "key_dark_1",
                                    //     "yes": {
                                    //         "style": "",
                                    //         "size": "",
                                    //         "content": "As you reach the end of the space. The light on the key grow stronger.\nEnough for you to see a door.\nYou try to unlock it with the key and it work.",
                                    //         "effect": []
                                    //     },
                                    //     "no": {
                                    //         "style": "",
                                    //         "size": "",
                                    //         "content": "You consider the fact that you need a key to open the door.\nBut there's another problem on the table.\nWhile you try your options, the monster you fought rise again, make a wierd noise.",
                                    //         "effect": [
                                    //             {
                                    //                 "phase": "battle",
                                    //                 "level": "p-1-1",
                                    //                 "type": "random"
                                    //             }
                                    //         ]
                                    //     }
                                    // }
                                },
                                {
                                    "person": "",
                                    "style": "yellow",
                                    "size": "",
                                    "content": "This is the end of the demo.\nThank you for playing the game."
                                }
                            ]
                        }
                    ],
                    "trigger": "auto"
                }
            ], // Pre-defined events
            "enemy": [
                {
                    "name": 'Zombie',
                    "job": 'mob_zombie_1'
                }
            ],
            "objective": {
                // In what condition does player clear the level
                // Clear all, pass X turns, Defeat XXX...etc
                "victory": {
                    "target": "enemy",
                    "value": 0
                },
                // In what condition does player lose the level
                // Defeat all, XXX down...etc
                "fail": {
                    "target": "player",
                    "value": 0
                },
                // In what condition does player get bonus
                "optional": [
                    {
                        "target": "turn",
                        "value": 6,
                        "prize": [
                            { // Prize for clear the level
                                "id": 'currency_1',
                                "type": 1,
                                "amount": 100
                            }
                        ]
                    }
                ]
            },
            "difficulty": 1
        },
    ],

    getAll(){
        return this.data
    },

    getOne(id){
        return this.data.find(k => k.id === id)
    },

    search(keyWord){
        return this.data.filter(k => k.name.includes(keyWord))
    },

    getTile(id, row, col){
        const map = this.data.find(l => l.id === id).map

        return map[row][col]
    }
}