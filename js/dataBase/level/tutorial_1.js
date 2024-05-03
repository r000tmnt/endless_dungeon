import { t } from '../../utils/i18n'

export default {
    "id": "tutorial_1",
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
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    "audio": "Alexander Ehlers - Warped", // Audio for battle phase
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
    // Pre-defined events
    "event": [
        // Before battle phase
        {
            "position": {},
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
                            "content": t("tutorial_1.dialogue_1"), // text content
                            "audio": [] // Audio name
                        },
                        {
                            "person": "",
                            "style": "",
                            "size": "",
                            "content": t("tutorial_1.dialogue_2"),
                            "audio": []
                        },
                        {
                            "person": "",
                            "style": "", 
                            "size": "", 
                            "content": t("tutorial_1.dialogue_3"),
                            "audio": []
                        },
                        {
                            "person": "",
                            "option": [
                                {
                                    "value": t("tutorial_1.option_1.value"),
                                    "style": "",
                                    "size": "",
                                    "content": t("tutorial_1.option_1.content"),
                                    "effect": [],
                                    "audio": ['click']
                                },
                                {
                                    "value": t("tutorial_1.option_2.value"),
                                    "style": "",
                                    "size": "",
                                    "content": t("tutorial_1.option_2.content"),
                                    "effect": [
                                        {
                                            "target": "player_1", // Default to the first player created
                                            "attribute": "hp",
                                            "value": -1,
                                        }
                                    ],
                                    "audio": ['click']
                                }
                            ],
                        },
                        {
                            "person": "",
                            "style": "",
                            "size": "",
                            "content": t("tutorial_1.dialogue_4"),
                            "audio": []
                        },
                        {
                            "person": "",
                            "style": "",
                            "size": "",
                            "content": t("tutorial_1.dialogue_5"),
                            "audio": []
                        },
                        {
                            "person": "",
                            "style": "",
                            "size": "",
                            "content": t("tutorial_1.dialogue_6"),
                            "audio": []
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
                            "content": t("tutorial_1.dialogue_7"),
                            "audio": [],
                        },
                        {
                            "person": "",
                            "style": "",
                            "size": "",
                            "content": t("tutorial_1.dialogue_8"),
                            "audio": []
                        },
                        {
                            "person": "unknow",
                            "style": "",
                            "size": "",
                            "content": t("tutorial_1.dialogue_9"),
                            "audio": []
                        },
                        {
                            "person": "",
                            "style": "",
                            "size": "",
                            "content": t("tutorial_1.dialogue_10"),
                            "audio": []
                        },
                        {
                            "person": "unknow",
                            "style": "",
                            "size": "",
                            "content": t("tutorial_1.dialogue_11"),
                            "audio": []
                        },
                        {
                            "person": "unknow",
                            "style": "",
                            "size": "",
                            "content": t("tutorial_1.dialogue_12"),
                            "audio": []
                        },
                        {
                            "person": "unknow",
                            "style": "",
                            "size": "",
                            "content": t("tutorial_1.dialogue_13"),
                            "audio": []
                        },
                        {
                            "person": "none",
                            "style": "",
                            "size": "",
                            "content": t("tutorial_1.dialogue_14"),
                            "audio": []
                        },
                        {
                            "person": "",
                            "option": [
                                {
                                    "value": t("tutorial_1.option_3.value"),
                                    "style": "",
                                    "size": "",
                                    "content": t("tutorial_1.option_3.content"),
                                    "effect": [ // player equipt with the knife
                                        {
                                            "target": "player_1",
                                            "attribute": "equip",
                                            "type": 3,
                                            "value": "knife_1"
                                        }
                                    ],
                                    "audio": ['click']
                                },
                                {
                                    "value": t("tutorial_1.option_4.value"),
                                    "style": "",
                                    "size": "",
                                    "content": t("tutorial_1.option_4.content"),
                                    "effect": [
                                        {
                                            "target": "enemy_1",
                                            "attribute": "hp",
                                            "value": -1
                                        }   
                                    ],
                                    "audio": ['click']
                                }
                            ]
                        },
                        {
                            "person": "none",
                            "style": "",
                            "size": "",
                            "content": t("tutorial_1.dialogue_15"),
                            "audio": []
                        },
                        {
                            "person": "unknow",
                            "style": "",
                            "size": "",
                            "content": t("tutorial_1.dialogue_16"),
                            "audio": []
                        }
                    ]
                }
            ],
            "trigger": "auto"
        },
        // After battle phase
        {
            "position": {},
            "item": [],
            "scene": [
                {
                    "background": "cave",
                    "audio": "cave_ambience",
                    "people": 0,
                    "dialogue": [
                        {
                            "person": "none",
                            "style": "",
                            "size": "",
                            "content": t("tutorial_1.dialogue_17"),
                            "audio": []
                        },
                        {
                            "person": "",
                            "style": "",
                            "size": "",
                            "content": t("tutorial_1.dialogue_18"),
                            "audio": []
                        },
                        {
                            "person": "",
                            "style": "",
                            "size": "",
                            "content": t("tutorial_1.dialogue_19"),
                            "audio": []
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
                            "content": t("tutorial_1.dialogue_20"),
                            "audio": ['key_jiggle', 'door_open']
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
                            "content": t("demo"),
                            "audio": []
                        }
                    ]
                }
            ],
            "trigger": "auto"
        }
    ], 
    // Define how many enemy on the stage
    "enemy": [
        {
            "name": 'Zombie',
            "job": 'mob_zombie_1',
            "startingPoint": {
                "x": 2,
                "y": 11
            }
        }
    ],
    // Define how many player on the stage
    "player": [
        {
            // Player name and job is for user to define
            "startingPoint": {
                "x": 3,
                "y": 11
            }
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
}