import { success } from "zod";
import { pool } from "../config/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

export const handleSwipe = TryCatch(async(req,res,next)=>{
    const senderId = (req as any).user.id;
    const { receiverId, type } = req.body; 

    if (senderId === receiverId) {
        return next(new ErrorHandler(400, "You cannot swipe on yourself"));
    }

    //save swipes in dB
    await pool.query(`
        INSERT INTO swipes (sender_id , receiver_id , type) 
        VALUES ($1,$2,$3)
        ON CONFLICT (sender_id , receiver_id) DO UPDATE SET type = $3`,
        [senderId,receiverId,type] 
    )

    let isMatch = false;
    
    if(type == 'like'){
        //SELECT 1 aur LIMIT 1 se db pehla matching milte hi ruk jayega, poori table scan nahi karega.
        const reverseSwipe = await pool.query(`SELECT 1 FROM swipes WHERE sender_id = $1 AND receiver_id = $2 AND type = 'like' LIMIT 1`,[receiverId, senderId]);

        //insert data after a match 
        if(reverseSwipe.rows.length > 0){
            isMatch = true;

            // Matches table mein entry dalo (user_1 hamesha choti ID wala taaki duplicate na ho)
            const [u1 , u2] = [senderId , receiverId].sort();
            await pool.query(`INSERT INTO matches (user_1,user_2) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [u1,u2]);


            //CAN SEND NOTIFICATION VIA SOCKET AFTER MATCH
        }
    }

    res.status(200).json({
        success: true,
        isMatch,
        message: isMatch ? "It's a Match! ❤️" : "Swipe recorded"
    })
});

export const getRandomProfiles = TryCatch(async(req,res,next)=>{
    const userId = (req as any).user.id;
    const userProfile = await pool.query("SELECT gender_preference FROM profiles WHERE user_id = $1", [userId]);
    if (userProfile.rows.length === 0) {
        return next(new ErrorHandler(400, "Please complete your profile first"));
    }

    
})