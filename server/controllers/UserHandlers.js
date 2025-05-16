const User=require('../models/user');
const Chat=require('../models/chat');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup=async(req,res)=>{
    try{
        const {name,email,password}=req.body;
        const exist=await User.findOne({email});
        if(exist){
            return res.status(400).json({message:'User already exists with this email'});
        }

        const hashedPassword=await bcrypt.hash(password,10);
        const user=new User({
            name,
            email,
            password:hashedPassword
        });
        await user.save();
        res.status(201).json({message:'User created successfully'});
    }
    catch(e){
        console.log(e);
        res.status(500).json({message:'Internal server error during signup'});
    }
}

exports.login=async(req,res)=>{
    try{
        const {email,password}=req.body;
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message:'User not found'});
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:'Invalid credentials'});
        }


        const token=jwt.sign({id:user._id,name:user.name,email:user.email},process.env.JWT_SECRET);
        const options={
            expires:new Date(Date.now()+3*24*60*60*1000),
            httpOnly:true,
        }

        return res.cookie('token',token,options).status(200).json({
            success:true,
            message:"Login Successful"
        })
    }
    catch(e){
        console.log(e);
        res.status(500).json({message:'Internal server error during login'});
    }
}

exports.logout=async(req,res)=>{
    try{
        return res.clearCookie('token').json({
            success: true,
            message: "User Logged Out Successfully"
        });
    }
    catch(e){
        console.log(e);
        res.status(500).json({message:'Internal server error during logout'});
    }
}

exports.fetchAllChats=async(req,res)=>{
    try{
        const user=await User.findById(req.payload.id).populate('chats');
        if(!user){
            return res.status(404).json({message:'User not found'});
        }

        return res.status(200).json({
            success:true,
            chats:user.chats
        });
    }
    catch(e){
        console.log(e);
        res.status(500).json({message:'Internal server error during fetching all chats'});
    }
};

