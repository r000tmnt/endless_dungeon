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
    [1, 0, 3, 2, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  "depth": [
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]
  ],
  "audio": "Alexander Ehlers - Warped",
  "assets": [
    "",
    "wall.png",
    "",
    "",
    "item.png"
  ],
  "phase": ["conversation", "titleCard", "battle", "conversation", "end"],
  "event": [
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
              "person": "",
              "style": "",
              "size": "",
              "content": t("tutorial_1.dialogue_1"),
              "audio": []
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
                  "response": [{
                    "person": "",
                    "style": "#ffffff",
                    "size": "",
                    "content": t("tutorial_1.option_1.content")
                  }],
                  "effect": []
                },
                {
                  "value": t("tutorial_1.option_2.value"),
                  "style": "",
                  "size": "",
                  "response": [{
                    "person": "",
                    "style": "#ffffff",
                    "size": "",
                    "content": t("tutorial_1.option_2.content")
                  }],
                  "effect": [
                    { "target": "player_1", "attribute": "hp", "value": -1 }
                  ]
                }
              ]
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
            }
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
              "audio": []
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
                  "response": [{
                    "person": "",
                    "style": "#ffffff",
                    "size": "",
                    "content": t("tutorial_1.option_3.content")
                  }],
                  "effect": [
                    {
                      "target": "player_1",
                      "attribute": "equip",
                      "type": 3,
                      "value": "knife_1"
                    }
                  ],
                  "audio": []
                },
                {
                  "value": t("tutorial_1.option_4.value"),
                  "style": "",
                  "size": "",
                  "response": [{
                    "person": "",
                    "style": "#ffffff",
                    "size": "",
                    "content": t("tutorial_1.option_4.content")
                  }],
                  "effect": [
                    { "target": "enemy_1", "attribute": "hp", "value": -1 }
                  ]
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
            },
            {
              "person": "",
              "style": "",
              "size": "",
              "content": t("tutorial_1.dialogue_20"),
              "audio": ["key_jiggle", "door_open"]
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
  "enemy": [
    {
      "name": "Zombie",
      "job": "mob_zombie_1",
      "startingPoint": { "x": 2, "y": 11 }
    }
  ],
  "player": [{ "startingPoint": { "x": 3, "y": 11 } }],
  "objective": {
    "victory": { "target": "enemy", "value": 0 },
    "fail": { "target": "player", "value": 0 },
    "optional": [
      {
        "target": "turn",
        "value": 6,
        "prize": [{ "id": "currency_1", "type": 1, "amount": 100 }]
      }
    ]
  },
  "difficulty": 1
}
