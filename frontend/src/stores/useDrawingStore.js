import { create } from "zustand";
import axiosInstance from "../util/axios";
import { toast } from "react-hot-toast";

export const useDrawingStore = create((set, get) => ({
    boards: [],
    currentBoard: null,
    loading: false,

    createBoard: async ({ title }) => {
        set({ loading: true });

        try {
            const res = await axiosInstance.post("/drawings/createBoard", { title });
            set((state) => ({
                boards: [res.data.data, ...state.boards],
                loading: false,
                currentBoard: res.data.data
            }));
            toast.success("Board created successfully");
            return res.data.data;
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "Failed to create board");
            return false;
        }
    },

    fetchBoards: async () => {
        set({ loading: true });

        try {
            const res = await axiosInstance.get("/drawings/fetchBoards");
            set({ boards: res.data.data, loading: false });
           
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "Failed to fetch boards");
        }
    },

    updateBoard: async ({ boardId, elements }) => {
        try {
            const res = await axiosInstance.post("/drawings/updateBoard", { boardId, elements });
            set((state) => ({
                boards: state.boards.map((board) =>
                    board.id === boardId ? { ...board, elements } : board
                )
            }));

             toast.success("Board saved successfully")
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save drawing");
        }
    },

    setCurrentBoard: (board) => {
        set({ currentBoard: board });
    }
}));