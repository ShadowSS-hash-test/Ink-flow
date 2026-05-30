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
			set({ user: response.data.data, checkingAuth: false });
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

     

 updateProfile: async (displayName, emailAddress, password) => {
        set({ loading: true });
        try {
            const res = await axiosInstance.post("/user/updateProfile", { 
                displayName, 
                emailAddress, 
                password 
            });
            set({ loading: false, user: res.data.data });
            toast.success("Profile updated successfully");
            return true; // Return true on success
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "Failed to update profile");
            return false; // Return false on failure
        }
    },

    updatePassword: async (passwords) => {
        set({ loading: true });
        try {
            const res = await axiosInstance.post("/user/updatePassword", passwords);
            set({ loading: false });
            toast.success(res.data.message || "Password updated successfully");
            return true; // Return true so frontend knows to close the form
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "Failed to update password");
            return false;
        }
    },

    deleteAccount: async (password) => {
        set({ loading: true });
        try {
            const res = await axiosInstance.post("/user/deleteAccount", { password });
            set({ loading: false, user: null }); // Clear the user on deletion
            toast.success(res.data.message || "Account deleted successfully");
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "Failed to delete account");
        }
    }




}))

