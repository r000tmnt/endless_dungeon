export default class Character {
    constructor(name, hp, mp, str, def, int, spd){
        this.name = name
        this.hp = hp
        this.maxHp = hp
        this.mp = mp
        this.maxMp = mp
        this.str = str
        this.def = def
        this.int = int
        this.spd = spd
        this.ap = 3
        this.status = 'healthy'
    }

    skills = []

    setSkills(skill){
        this.skills.push(skill)
    }

    setStatus(status){
        this.status = status
    }

}