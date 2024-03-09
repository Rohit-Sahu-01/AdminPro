const express = require("express");
const cors = require("cors");
require('dotenv').config()
const mongoose = require("mongoose");
const multer=require('multer')
const t_login = require("./models/Admin.models");
const t_employee = require("./models/Employee.models");
const cloudinary =require('cloudinary').v2
require('dotenv').config()
const path=require('path')
const bodyParser=require('body-parser')
const app = express();
const port = 3000;

app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors());

mongoose.connect("mongodb://localhost:27017/intern_db").then(() => console.log("DB CONNECTED")).catch((e) => console.log(e));

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET 
});

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'image/')
    },
    filename:function(req,file,cb){
        cb(null,file.originalname+'_'+Date.now())
    }
});

const upload=multer({storage,
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
          cb(new Error("Unsupported file type!"), false);
          return;
        }
        cb(null, true);
      },})

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  t_login.findOne({ f_userName: username }).then((data) => {
    if (data) {
      if (data.f_Pwd == password) {
        res.json({
          code: 200,
          path: "/home",
          message: "Login Successfully",
          name: username,
        });
      } else {
        res.json({ code: 301, path: "/", message: "Check Credentials" });
      }
    } else {
      res.json({ code: 303, path: "/", message: "Error Occured" });
    }
  });
});

app.post("/add",upload.single('image'), async (req, res) => {
  console.log(req.body)
  const {name,email,phonenumber,designation,gender,courses}=req.body

  t_employee.findOne({ f_Email: email }).then((data) => {
    if (data) {
      return res.json({  message: "Email Already Exist" });
    }
  });

  const result = await cloudinary.uploader.upload(req.file.path);

  const data = t_employee({
    f_Image_url: result.secure_url,
    f_Cloud_id:result.public_id,
    f_Image_path:req.file.path,
    f_Name: name,
    f_Email: email,
    f_Mobile: phonenumber,
    f_Designation: designation,
    f_gender: gender,
    f_Course: courses,
  });
  await data.save();
  res.json({ code: 200, message: "DATA ADDED SUCCESSFULLY" });
});

app.get('/list',async(req,res)=>{
    const data=await t_employee.find()
    res.json(data)
})

app.delete('/employees/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await t_employee.findByIdAndDelete(id);
      if (!employee) {
        return res.status(404).json({ message: 'EMPLOYEE NOT FOUND' });
      }
      res.json({ message: 'EMPLOYEE DELETED SUCCESSFULLY' });
    } catch (error) {
      console.error('Error deleting employee:', error);
      res.status(500).json({ message: 'INTERNAL SERVER ERROR' });
    }
  });

  app.get('/employees/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await t_employee.findById(id);
      if (!employee) {
        return res.status(404).json({ message: 'EMPLOYEE NOT FOUND'});
      }
      res.json({ path:'/edit',id: id });
    } catch (error) {
      
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/editlist',async(req,res)=>{
    try {
        const data = req.body.data;
        await t_employee.findOne({_id:data}).then((data) => {
            if (data) 
            {
                res.json(data)
            }
          });
      } catch (error) {
            
            res.status(500).json({ message: 'Internal server error' });
      } 
  })

  app.post('/update',async(req,res)=>{
    const {id,name,email,phonenumber,designation,gender,courses,imageurl}=req.body
    
    const respondData=await t_employee.findById({_id:id})
    await t_employee.findByIdAndUpdate({ _id: id },{
      f_Image_url: imageurl,
      f_Cloud_id:respondData.f_Cloud_id,
      f_Name: name,
      f_Email: email,
      f_Mobile: phonenumber,
      f_Designation: designation,
      f_gender: gender,
      f_Course: courses,
    },
    {new:true,upsert:true})

    res.json({ code: 200, message: "DATA UPDATED SUCCESSFULLY" });
  })

  app.put('/updateImg',upload.single('image'),async(req,res)=>{
    
    const {id,name,email,phonenumber,designation,gender,courses,imageurl}=req.body
  
    const respond=t_employee.findById({ _id: id })

    if(respond.f_Cloud_id){
      const response=await cloudinary.uploader.destroy(respond.f_Cloud_id)
      
    }
    
    const result = await cloudinary.uploader.upload(req.file.path);
  
    const updateImg=await t_employee.findByIdAndUpdate({ _id: id },{
      f_Image_url: result.secure_url,
      f_Cloud_id:result.public_id,
      f_Image_path:req.file.path,
      f_Name: name,
      f_Email: email,
      f_Mobile: phonenumber,
      f_Designation: designation,
      f_gender: gender,
      f_Course: courses,
    },
    {new:true,upsert:true});

    res.json({ code: 200, message: "DATA & IMAGE UPDATED SUCCESSFULLY" });
  })

app.listen(process.env.PORT, () => {
  console.log(`SERVER IS RUNNING ${process.env.PORT}`);
});
