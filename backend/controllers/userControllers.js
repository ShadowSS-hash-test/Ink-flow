import sql from "../util/db.js";
import bcrypt from "bcrypt"

export const updateProfile = async (req, res) => {
    try {
       
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Token is invalid, please login first"
            });
        }

        const { id } = req.user;
        const { displayName, emailAddress } = req.body;

      
        const query = `UPDATE users SET username = $1, email = $2 WHERE id=$3 RETURNING username,email`;
        const result = await sql.query(query, [displayName, emailAddress, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "The person with this userID does not exist"
            });
        }

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        
        if (error.code === '23505') {
            const field = error.detail.includes('email') ? 'email address' : 'username';
            
            return res.status(409).json({
                success: false,
                message: `A user with this ${field} already exists`
            });
        }

        console.error("Error in updateProfile controller: " + error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;

        // 1. Authorization Check
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Token is invalid, please login first"
            });
        }
        const id = req.user.id;

        // 2. Input Validation: Missing fields
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "Make sure all the fields are filled"
            });
        }

        // 3. Input Validation: Matching passwords
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "Make sure new password and confirmNewPassword are matching"
            });
        }

        // 4. Input Validation: Same as old password
        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password cannot be the same as the current password"
            });
        }

     

        // 5. Fetch User
        let query = `SELECT password FROM users WHERE id=$1`;
        let result = await sql.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "A user with this ID doesn't exist"
            });
        }

        // 6. Verify Current Password (Corrected bcrypt.compare)
        const isPasswordValid = await bcrypt.compare(currentPassword, result.rows[0].password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid current password"
            });
        }
        
        // 7. Hash New Password and Update (Corrected plaintext issue)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        query = `UPDATE users SET password=$1 WHERE id=$2`;
        await sql.query(query, [hashedPassword, id]);

        return res.status(200).json({
            success: true,
            message: "Successfully updated your password"
        });

    } catch (error) {
        console.error("Error in updatePassword controller: ", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const deleteAccount = async(req,res)=>{
    
}