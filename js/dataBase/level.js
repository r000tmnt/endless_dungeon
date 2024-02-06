/**
 * Plase the conversation event at the beginning of the event array and state the trigger value as "auto"
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
            "phase": [ 'conversation', 'battle', 'conversation', 'intermission' ],
            "event": [
                {
                    "position": [],
                    "item": [],
                    "scene": [
                        {
                            "background": "", // Background image
                            "dialogue": [
                                {
                                    "person": "none",
                                    "message": [
                                        {
                                            "style": "", // color, default as white
                                            "size": "", // Default to setting fontSize, accept fontSize_md, fontSize_sm property
                                            "content": "......" // text content
                                        },
                                        {
                                            "style": "",
                                            "size": "",
                                            "content": "You feel quite a headache, like you've been hit by a boulder or somthing."
                                        }
                                    ]
                                },
                                {
                                    "person": "none",
                                    "message": [
                                        { 
                                            "style": "", 
                                            "size": "", 
                                            "content": "As you gradually regain your conscious.\nYou first...",
                                        }
                                    ],
                                },
                                {
                                    "person": "none",
                                    "message": [
                                        {
                                            "option": [
                                                {
                                                    "value": "Take a look around",                                            "style": "",
                                                    "size": "",
                                                    "content": "Although there not much light in here, you've notice that you're in a cave.",
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
                                    ]
                                },
                                {
                                    "person": "none",
                                    "message": [
                                        {
                                            "style": "",
                                            "size": "",
                                            "content": "You heard a voice whispering beyond the entrence.\nIt is not clear enough for anyone to understand. But it gives you a direction to follow."
                                        },
                                        {
                                            "style": "",
                                            "size": "",
                                            "content": "As you walk your way out of the cave. You start to get used to the lack of brightness of your surrounding."
                                        },
                                        {
                                            "style": "",
                                            "size": "",
                                            "content": "That voice draws you further, until you reach a widther space."
                                        },
                                    ]
                                }
                            ]
                        },
                        {
                            "background": "",
                            "dialogue": [
                                {
                                    "person": "unknow",
                                    "message": [
                                        {
                                            "style": "",
                                            "size": "",
                                            "content": "Oh...you finially awake."
                                        }
                                    ]
                                },
                                {
                                    "person": "none",
                                    "message": [
                                        {
                                            "style": "",
                                            "size": "",
                                            "content": "Due to the darkness, you bearly saw a silhouette of a person standing on the other side of the space."
                                        }
                                    ]
                                },
                                {
                                    "person": "unknow",
                                    "message": [
                                        {
                                            "style": "",
                                            "size": "",
                                            "content": "You should not come any closer, they will smell you."
                                        }
                                    ]
                                },
                                {
                                    "person": "none",
                                    "message": [
                                        {
                                            "style": "",
                                            "size": "",
                                            "content": "Just as the mysterious person finish the words. You have take a step already."
                                        }
                                    ]
                                },
                                {
                                    "person": "unknow",
                                    "message": [
                                        {
                                            "style": "",
                                            "size": "",
                                            "content": "Shit...! What did I told you."
                                        },
                                        {
                                            "style": "",
                                            "size": "",
                                            "content": "You're lucky there's only one of them."
                                        },
                                        {
                                            "style": "",
                                            "size": "",
                                            "content": "Here, catch."
                                        }
                                    ]
                                },
                                {
                                    "person": "none",
                                    "message": [
                                        {
                                            "style": "",
                                            "size": "",
                                            "content": "The mysterious person throws a knife on the ground near where you are standing.\nWould you...",
                                        }
                                    ],
                                },
                                {
                                    "person": "none",
                                    "message": [
                                        {
                                            "option": [
                                                {
                                                    "value": "Take the knife",
                                                    "style": "",
                                                    "size": "",
                                                    "content": "Soon as you pick up the kneif on the ground.\nYou heard another voice, and a rotten smell came after.",
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
                                            "style": "",
                                            "size": "",
                                            "content": "A sound of deadman approch towoards you."
                                        },
                                    ]
                                },
                                {
                                    "person": "unknow",
                                    "message": [
                                        {
                                            "style": "",
                                            "size": "",
                                            "content": "Suit yourself, I'm out of here"
                                        }
                                    ]
                                    // proceed to battle phase
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
                                "condition": 0,
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