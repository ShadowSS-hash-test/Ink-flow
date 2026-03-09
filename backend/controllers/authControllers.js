import sql from "../util/db.js";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()



export const signup = async(req,res)=>{

    try{

           const {username,email,password,confirmPassword} = req.body;
           
           if(!username || !email || !password || !confirmPassword)
           {
              return res.status(404).json({
                success:false,
                 message:"Fill all the required details"
              })
           }

           if(password!==confirmPassword){
               
            return res.status(404).json({
               success:false,
               message:"Please make sure your password and confirmPassword fields are matching"
            })
           }

           //check if the email or username already exists or not

           const checkEmail = `SELECT * FROM users WHERE email = $1 or username = $2`;

           const result = await sql.query(checkEmail,[email,username])

           if(result.rowCount >= 1){
            return res.status(500).json({
               success:false,
               message:"A user with this email or username already exists."
            })
           }

           let EncryptedPassword;

           try{
             const salt = await bcrypt.genSalt(10);
              EncryptedPassword = await bcrypt.hash(password,salt);

           }catch(error){
            console.log("Error occured while hashing the password in the signup controller")
             return res.status(500).json({
               success:false,
               message:error.message
             })
           }


         const insertQuery = `
         INSERT INTO users (username, email, password) 
         VALUES ($1, $2, $3) 
         RETURNING id, username, email;
         `;

          const newUser = await sql.query(insertQuery,[username,email,EncryptedPassword])
           

          const token = jwt.sign({userId: newUser.rows[0].id},process.env.JWT_SECRET,{ expiresIn: '1h' });

          res.cookie("access_token", token, {
               httpOnly: true, 
               secure: process.env.NODE_ENV === "production", 
               })

          return res.status(200).json({
            success:true,
            data:newUser.rows[0]
          })

         

   

    }catch(error){
      console.log("error in signup controller: ", error.message)
      return res.status(500).json({
         success:false,message:"Error occured"
      })

    }
 

}

export const signin = async(req,res)=>{
    try{

      const {email,password} = req.body;

      if(!email || !password){
         return res.status(404).json({
            success:false,
            message:"Please fill all required fields"
         })
      }

      const q = `SELECT * FROM users WHERE email = $1`;

      const result = await sql.query(q,[email]);

      if(result.rowCount == 0){
      
           return res.status(404).json({
            success:false,
            message:"Invalid password or email"
         })
      }

      const verify = await bcrypt.compare(password,result.rows[0].password);

      if(!verify){
         return res.status(404).json({
            success:false,
            message:"Invalid password or email"
         })
      }

         const token = jwt.sign({userId: result.rows[0].id},process.env.JWT_SECRET,{ expiresIn: '1h' });

          res.cookie("access_token", token, {
               httpOnly: true, 
               secure: process.env.NODE_ENV === "production", 
               })


      return res.status(200).json({
          success:true,
          message:"Logged in successfully"

      })

    }catch(error){
      console.log("Error in sign-in controller ", error.message)
      return res.status(500).json({
         success:false,
         message:error.message
      })
    }
}