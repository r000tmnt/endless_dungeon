import { t } from '../../utils/i18n'

export default{
    data: [
        {
            "id": "material_meat_2",
            "name": t("item.material_meat_2.name"),
            "stackLimit": 10,
            "type": 2,
            "effect": {
                "lv": 1,
                "type": 2,
                "target": "status",
                "amount": "Poison",
                "rate": 70,
                "desc": t("item.material_meat_2.desc")
            }
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