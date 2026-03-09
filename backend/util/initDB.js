import sql from "./db.js";

const initDB = async()=>{

const userTable = `CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);`

const drawingsTable = `CREATE TABLE IF NOT EXISTS drawings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, 
  title VARCHAR(100) DEFAULT 'Untitled',
  elements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`

   try{
       await sql.query(userTable)
       console.log("User Table initialized successfully")
       
       await sql.query(drawingsTable)
       console.log("Drawings Table initialized successfully")

   }
   catch(error){
        console.log("Error occured while initializing tables: ", error)
   }

}

export default initDB