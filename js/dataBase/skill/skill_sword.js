export default [
    {
        "id": "sword_slash_1",
        "name": "Slash",
        "type": 1, // skill weapon type
        "cost": {
            "attribute": "mp",
            "value": 3
        },
        "animation": "slash",
        "effect":
        {
            "type": 0, // offence or defence
            "range": 1,
            "base_on_attribute": "str",
            "multiply_as": 0, // solid or percentage
            "base_number": 10,
            "desc": "A quick and powerful strike with sword"
        }
    },
]