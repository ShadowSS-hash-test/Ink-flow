import axios from "axios";


const nodeEnv = import.meta.env.VITE_NODE_ENV; 
const backendUrl = import.meta.env.BACKEND_URL;

const axiosInstance = axios.create({
	baseURL: nodeEnv === "Development"? "http://localhost:3000/api": backendUrl,
	withCredentials: true, 
});

export default axiosInstance;