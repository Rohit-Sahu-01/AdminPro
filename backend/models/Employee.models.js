const mongoose=require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const EmployeeSchema=mongoose.Schema({
    f_Id:Number,
    f_Cloud_id:String,
    f_Image_url:String,
    f_Image_path:String,
    f_Name:String,
    f_Email:String,
    f_Mobile:String,
    f_Designation:String,
    f_gender:String,
    f_Course:String,
    f_Createdate:String, 
    createdAt: {
        type: Date,
        default: Date.now,
      }
})

EmployeeSchema.plugin(AutoIncrement, { inc_field: 'f_Id' });

const t_employee=mongoose.model('t_employee',EmployeeSchema)

module.exports=t_employee