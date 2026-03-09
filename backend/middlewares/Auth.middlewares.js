import jwt from "jsonwebtoken";
import sql from "../util/db.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
  }


  jwt.verify(token, process.env.JWT_SECRET, async (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Forbidden: Invalid token" });
    }

    try {
      const q = `SELECT id, username, email FROM users WHERE id = $1`;
      
    
      const result = await sql.query(q, [decodedUser.userId]); 
      
     
      if(result.rowCount === 0) {
          return res.status(404).json({ success: false, message: "User not found" });
      }

      req.user = result.rows[0]; 
      next(); 
      
    } catch (dbError) {
      console.error("Database error in verifyToken:", dbError);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
};