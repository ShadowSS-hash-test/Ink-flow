import axios from "axios";

const nodeEnv = import.meta.env.VITE_NODE_ENV; 
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const axiosInstance = axios.create({
    baseURL: nodeEnv === "Development" ? "http://localhost:3000/api" : backendUrl + "/api",
    withCredentials: true, 
});

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 && 
            !originalRequest._retry && 
            originalRequest.url !== "/auth/refresh-token"
        ) {
            originalRequest._retry = true; 

            try {
                // 1. Make a raw axios call to refresh the token to avoid Circular Dependencies
                await axios.post(
                    `${axiosInstance.defaults.baseURL}/auth/refresh-token`,
                    {}, // empty body
                    { withCredentials: true } // Crucial to send the refresh cookie
                );

                // 2. If successful, retry the original failed request
                return axiosInstance(originalRequest);
                
            } catch (refreshError) {
                // 3. If refresh fails, dynamically import the store and log the user out
                const { useUserStore } = await import("../stores/useUserStore.js");
                useUserStore.setState({ user: null });
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;