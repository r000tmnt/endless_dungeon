import { t } from '../../utils/i18n'

export default{
    data: [
        {
            "id": "currency_1",
            "name": t("item.currency_1.name"),
            "stackLimit": 5000,
            "type": 1,
            "effect": {
                "desc": t("item.currency_1.desc")
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