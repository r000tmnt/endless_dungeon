import { t } from '../../utils/i18n'

export default{
    data: [
        {
            "id": "armor_light_1",
            "name": t("item.armor_light_1.name"),
            "type": 4,
            "stackLimit": 1,
            "position": "body",
            "effect":{
                "base_attribute":{
                    "def": 2
                },
                "desc": t("item.armor_light_1.desc")
            },
            "prefix": [],
            "suffix": []
        }
    ],

    getAll(){
        return this.data
    },

    getOne(id){
        return this.data.find(a => a.id === id)
    },

    search(keyWord){
        return this.data.filter(a => a.name.includes(keyWord))
    }
}