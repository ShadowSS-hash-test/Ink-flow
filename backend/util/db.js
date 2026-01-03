import { Pool } from "pg";
import dotenv from "dotenv"

const sql = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
  },
});

export default sql;

