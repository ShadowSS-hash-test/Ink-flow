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

export const updateBoard = async(req,res)=>{

}

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