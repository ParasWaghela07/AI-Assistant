const jwt=require('jsonwebtoken');
require('dotenv').config();

exports.auth=async(req,res,next)=>{
    try{
        let token=req.cookies.token;
        
        
        if(!token){
            return res.status(401).json({
                success:false,
                message:'Token Missing',
            });
        }

        try{
            const payload=jwt.verify(token,process.env.JWT_SECRET);
            req.payload=payload;
        }
        catch(e){
            console.log(e);
            return res.status(401).json({
                success:false,
                message:'token is invalid',
            });
        }
        next();
    }
    catch(e){
        return res.status(401).json({
            success:false,
            message:'Something went wrong, while verifying the token',
            error:e.message,
        });
    }
}