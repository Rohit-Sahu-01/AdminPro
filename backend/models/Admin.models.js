const mongoose=require('mongoose')

const AdminSchema=mongoose.Schema({
    f_sno:String,
    f_userName:String,
    f_Pwd:String

})

const t_login=mongoose.model('t_login',AdminSchema)

module.exports=t_login