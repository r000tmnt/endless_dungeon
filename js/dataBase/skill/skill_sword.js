export default [
    {
        "id": "sword_slash_1",
        "name": "Slash",
        "weapon": "sword",
        "type": "offense",
        "cost": {
            "attribute": "mp",
            "value": 3
        },
        "animation": "slash",
        "effect":
        {
            "type": "dmg",
            "range": 1,
            "base_on_attribute": "str",
            "multiply_as": "solid",
            "base_number": 10,
            "desc": "A quick and powerful strike with sword"
        }
    },
]