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
                                        "......",
                                        "You feel quite a headache, like you've been hit by a boulder or somthing."
                                    ]
                                },
                                {
                                    "person": "none",
                                    "message": ["As you gradually regain your conscious. You first..."],
                                    "option": [
                                        {
                                            "value": "Take a look around",
                                            "respond": "Although there not much light in here, you've notice that you're in a cave",
                                            "effect": []
                                        },
                                        {
                                            "value": "Lay down on the ground",
                                            "respond": "You slowly bend down your body against the ground. Then you realize that your cloth is in a poor condition, not enough to protect you from the low temperature",
                                            "effect": [
                                                {
                                                    "target": "player",
                                                    "attribute": "hp",
                                                    "value": -1,
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "person": "none",
                                    "message": [
                                        "You heard a voice whispering beyond the entrence. It is not clear enough for anyone to understand. But it gives you a direction to follow.",
                                        "As you walk your way out of the cave. You start to get used to the lack of brightness of your surrounding.",
                                        "That voice draws you further, until you reach a widther space",
                                    ]
                                }
                            ]
                        },
                        {
                            "background": "",
                            "dialogue": [
                                {
                                    "person": "unknow",
                                    "message": [ "Oh...you finially awake." ]
                                },
                                {
                                    "person": "none",
                                    "message": [ "Due to the darkness, you bearly saw a silhouette of a person standing on the other side of the space." ]
                                },
                                {
                                    "person": "unknow",
                                    "message": [
                                        "You should not come any closer, they will smell you."
                                    ]
                                },
                                {
                                    "person": "none",
                                    "message": [
                                        "Just as the mysterious person finish the words. You have take a step already."
                                    ]
                                },
                                {
                                    "person": "unknow",
                                    "message": [
                                        "Shit...! What did I told you.",
                                        "You're lucky there's only one of them.",
                                        "Here, catch."
                                    ]
                                },
                                {
                                    "person": "none",
                                    "message": [
                                        "The mysterious person throws a knife on the ground near where you are standing.",
                                        "Would you..."
                                    ],
                                    "option": [
                                        {
                                            "value": "Take the knife",
                                            "respond": [
                                                "Soon as you pick up the kneif on the ground. You heard another voice, and a rotten smell came after.",
                                                "A sound of deadman approch towoards you"
                                            ],
                                            "effect": [] // player equipt with the knife
                                        },
                                        {
                                            "value": "I trust on my own fist",
                                            "respond": [
                                                "You kicked the knife out of your reach. Yet it stops in the middle like it hit something solid, and it is not the sound of the ground or stone either."
                                            ],
                                            "effect": [
                                                {
                                                    "target": "enemy",
                                                    "attribute": "hp",
                                                    "value": -1
                                                }   
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "person": "unknow",
                                    "messsage": [
                                        "Suit yourself, I'm out of here"
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