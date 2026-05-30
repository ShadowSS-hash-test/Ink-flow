import axios from "axios";
import dotenv from "dotenv";

dotenv.config();



const axiosInstance = axios.create({
	baseURL: process.env.NODE_ENV === "Development"? "http://localhost:3000/api": "https://ink-flow.onrender.com/api",
	withCredentials: true, 
});

export default axiosInstance;