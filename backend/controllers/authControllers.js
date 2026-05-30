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
           

          const access_token = jwt.sign({userId: newUser.rows[0].id},process.env.JWT_ACCESS_TOKEN_SECRET,{ expiresIn: '15m' });
          const refresh_token = jwt.sign({userId: newUser.rows[0].id},process.env.JWT_REFRESH_TOKEN_SECRET,{ expiresIn: '7d' })

          res.cookie("access_token", access_token, {
               httpOnly: true, 
               secure: process.env.NODE_ENV === "Production", 
                maxAge:15*60*1000
               })

         res.cookie("refresh_token",refresh_token,{
               httpOnly: true, 
               secure: process.env.NODE_ENV === "Production",
                maxAge:7*24*60*60*1000 
               })

          return res.status(200).json({
            success:true,
            data: {
                id: newUser.rows[0].id,
                username: newUser.rows[0].username,
                email: newUser.rows[0].email
            }
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

         const access_token = jwt.sign({userId: result.rows[0].id},process.env.JWT_ACCESS_TOKEN_SECRET,{ expiresIn: '15m' });
          const refresh_token = jwt.sign({userId: result.rows[0].id},process.env.JWT_REFRESH_TOKEN_SECRET,{ expiresIn: '7d' })

          res.cookie("access_token", access_token, {
               httpOnly: true, 
               secure: process.env.NODE_ENV === "Production",
                maxAge:15*60*1000, 
               })

         res.cookie("refresh_token",refresh_token,{
               httpOnly: true, 
               secure: process.env.NODE_ENV === "Production", 
                maxAge:7*24*60*60*1000
               })

      return res.status(200).json({
          success:true,
          message:"Logged in successfully",
          data: {
                id: result.rows[0].id,
                username: result.rows[0].username,
                email: result.rows[0].email
            }

      })

    }catch(error){
      console.log("Error in sign-in controller: ", error.message)
      return res.status(500).json({
         success:false,
         message:error.message
      })
    }
}

export const refreshToken = async(req,res)=>{
    try{
        const refreshTok = req.cookies.refresh_token
        if(!refreshTok)
        {
            return res.status(401).json({
                message:"No refresh token found"
            })
        }

        let decoded;

      
             try {
                 decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);
                     
            } catch (err) {
           
            return res.status(401).json({
               success: false,
               message: "Invalid or expired token",
               errorType: err.name 
            });
            }

    
        const access_token = jwt.sign({userId: decoded.userId}, process.env.JWT_ACCESS_TOKEN_SECRET, {expiresIn:"15m"});

       res.cookie("access_token",access_token,{
        httpOnly:true,
        secure:process.env.NODE_ENV === "Production",
        sameSite:"strict",
        maxAge:15*60*1000 //15 mins

    })

    return res.status(200).json({
        message:"Successfully refreshed access token"
    })

 

    }catch(error)
    {
        console.log(`Error in refreshToken controller ${error}`)
        return res.status(500).json({
            success:false,
            message:error.message
        })

    }
}


export const logout = async(req,res)=>{
        try{
            
      
            res.clearCookie("refresh_token");
            res.clearCookie("access_token")
            res.json({message:"Logged out successfully"})

        }catch(error)
        {
              console.log("Error in logout controller: " + error)
            res.status(500).json({
                success:false,
                message:"failed to logout, internal server error.",
                err:error.message
            })

        }
        
}

export const getProfile = async (req, res) => {
    try {
     
        return res.status(200).json({
            success: true,
            data: req.user 
        });

    } catch (error) {
        console.log("Error in getProfile controller: ", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};