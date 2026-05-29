import sql from "../util/db.js";

export const createBoard = async (req, res) => {
    try {
        const { title } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Token is invalid, please login first"
            });
        }


        if (!title || title.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid title"
            });
        }

        const id = req.user.id;

        let query = `SELECT id FROM users WHERE id=$1`;
        let result = await sql.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "A user with this ID doesn't exist"
            });
        }

     
        query = `INSERT INTO drawings(user_id,title) VALUES($1,$2) RETURNING id,user_id,title,created_at,updated_at`;
        result = await sql.query(query, [id, title]);

        return res.status(201).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
      
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: "A board with this title already exists"
            });
        }

        console.log("Error in createBoard controller: ", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const updateBoard = async (req, res) => {
    try {
        const { boardId, elements } = req.body;

        // 1. Validate Input
        if (!boardId || !elements) {
            return res.status(400).json({
                success: false,
                message: "Board ID and drawing elements are required"
            });
        }

        // Safe to extract because verifyToken middleware passed
        const userId = req.user.id; 

        // 2. Update the database (checking user_id = $3 for ownership security)
        const query = `
            UPDATE drawings 
            SET elements = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2 AND user_id = $3 
            RETURNING id, title, elements, created_at, updated_at
        `;
        
       const result = await sql.query(query, [JSON.stringify(elements), boardId, userId]);

        // 3. Check if the board was actually found and updated
        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Board not found or you don't have permission to edit it"
            });
        }

        // 4. Return success
        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.log("Error in updateBoard controller: ", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const fetchBoards = async(req,res)=>{
 
    try {

         if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Token is invalid, please login first"
            });
        }

        const id = req.user.id;

         let query = `SELECT id FROM users WHERE id=$1`;
        let result = await sql.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "A user with this ID doesn't exist"
            });
        }

        query = `SELECT id,title,elements,created_at,updated_at FROM drawings WHERE user_id = $1 ORDER BY updated_at DESC`
        result = await sql.query(query,[id]);

        return res.status(200).json({
            success:true,
            data:result.rows
        })

        
    } catch (error) {
        console.log("error in fetchBoards controller: ",error.message)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
      

}

export const deleteBoard = async (req, res) => {
    try {
        const { boardId } = req.params; 
        const userId = req.user.id; // Guaranteed to exist by your auth middleware

        if (!boardId) {
            return res.status(400).json({
                success: false,
                message: "Board ID is required"
            });
        }

        // Delete the board only if it belongs to the logged-in user
        const query = `
            DELETE FROM drawings 
            WHERE id = $1 AND user_id = $2 
            RETURNING id, title
        `;
        
        const result = await sql.query(query, [boardId, userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Board not found or you don't have permission to delete it"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Board deleted successfully",
            data: result.rows[0] 
        });

    } catch (error) {
        console.log("Error in deleteBoard controller: ", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};