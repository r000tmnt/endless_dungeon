export default{
    data: [
        {
            "id": "p_1",
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
                                    "message": "......"
                                },
                                {
                                    "person": "none",
                                    "message": "You feel quite a headache, like you've been hit by a boulder or somthing.",
                                    "option": []
                                },
                                {
                                    "person": "none",
                                    "message": "As you gradually regain your conscious. You first...",
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
                                                    "target": "hp",
                                                    "value": -1
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "person": "none",
                                    "message": "You heard a voice whispering beyond the entrence. It is not clear enough for anyone to understand. But it gives you a direction to follow."
                                },
                                {
                                    "person": "none",
                                    "message": "As you walk your way out of the cave. You start to get used to the lack of brightness of your surrounding"
                                }
                            ]
                        }
                    ]
                }
            ], // Pre-defined events
            "enemy": [],
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
    }
}