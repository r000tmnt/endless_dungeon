export default [
    {
        "id": "status_poison_1",
        "name": "Poison bite",
        "weapon": "none",
        "type": 8,
        "cost": {
            "attribute": "mp",
            "value": 1
        },
        "animation": "attack",
        "effect": {
            "type": 0,
            "range": 1,
            "base_on_attribute": "luk",
            "multiply_as": 1,
            "base_number": 3,
            "status": "Poison",
            "turn": 3, // How long will the effect lasting
            "desc": "Bite into the skin. Cause the foe to get poisoned."
        }
    },
    {
        "id": "status_focus_1",
        "name": "Focus",
        "weapon": "none",
        "type": 8,
        "cost": {
            "attribute": "mp",
            "value": 3
        },
        "animation": "enchant",
        "effect": {
            "type": 1,
            "range": 0, // Apply on the player itself
            "base_on_attribute": "none",
            "multiply_as": 2,
            "base_number": 3,
            "status": "Focus",
            "turn": 1,
            "desc": "Enhance the hit rate and evade rate by 30% on oneself"
        }
    },
    {
        "id": "status_focus_2",
        "name": "Clarity",
        "weapon": "none",
        "type": 8,
        "cost": {
            "attribute": "mp",
            "value": 5
        },
        "animation": "enchant",
        "effect": {
            "type": 1,
            "range": 1,
            "base_on_attribute": "none",
            "multiply_as": 2,
            "base_number": 3,
            "status": "Focus",
            "turn": 1,
            "desc": "Enhance the hit rate and evade rate by 30% to the target."
        }
    }
]