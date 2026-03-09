import { Pool } from '@neondatabase/serverless'; 
import dotenv from 'dotenv';
dotenv.config();

const sql = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default sql;