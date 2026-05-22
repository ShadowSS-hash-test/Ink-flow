import {create} from "zustand"
import axiosInstance from "../util/axios"
import {toast} from "react-hot-toast"

export const useUserStore = create((set,get)=>({
    user:null,
    loading:false,
    checkingAuth:false,

    signup: async({username,email,password,confirmPassword})=>{
        set({loading:true})
       

        try {
              const res = await axiosInstance.post("/auth/signup",{username,email,password,confirmPassword})
              set({loading:false,user:res.data.data})
              toast.success("Signed in successfully")  
              

            
        } catch (error) {
            set({loading:false});
            toast.error(error.response.data.message || "An error occurred")
            
        }

      




    },

    login: async({email,password})=>{
          set({loading:true})
      

        try {
              const res = await axiosInstance.post("/auth/signin",{email,password})
              set({loading:false,user:res.data.data})
              toast.success("Logged in successfully")  
        } catch (error) {
            set({loading:false});
            toast.error(error.response.data.message || "An error occurred")
            
        }


    },

    	checkAuth: async () => {
		set({ checkingAuth: true });
		try {
			const response = await axiosInstance.get("/auth/profile");
			set({ user: response.data, checkingAuth: false });
		} catch (error) {
			console.log(error.message);
			set({ checkingAuth: false, user: null });
		}
	},

    logout: async()=>{
           try {
            await axiosInstance.get("/auth/logout");
            toast.success("Logged out successfully")
            set({user:null})
            
           } catch (error) {
            console.log(error)
             toast.error(error.response?.data?.message || "An error occured during logout")
           }
    },

    

    refreshToken: async () => {
		
		if (get().checkingAuth) return;

		set({ checkingAuth: true });
		try {
			const response = await axiosInstance.post("/auth/refresh-token");
			set({ checkingAuth: false });
			return response.data;
		} catch (error) {
			set({ user: null, checkingAuth: false });
			throw error;
		}
	},




}))

