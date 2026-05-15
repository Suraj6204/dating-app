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

export const getRandomProfiles = TryCatch(async (req, res, next) => {
    const userId = (req as any).user.id;

    // 1. Logged-in user ki preference, location aur AI vector fetch karo
    const userResult = await pool.query(
        "SELECT gender_preference, bio_vector, location FROM profiles WHERE user_id = $1", 
        [userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].location) {
        return next(new ErrorHandler(400, "Please complete your profile and share location first"));
    }

    const { gender_preference, bio_vector, location: userLocation } = userResult.rows[0];

    // 2. Hybrid Query: PostGIS (50km) + Gender Filter + AI Ranking
    const query = `
        SELECT 
            u.id, 
            u.name, 
            p.bio, 
            p.images, 
            p.dob, 
            p.interests,
            -- Distance in meters ko KM mein convert karein
            ST_Distance(p.location, $1) / 1000 as distance_km,
            -- AI Similarity distance
            (p.bio_vector <=> $2) as vibe_distance
        FROM profiles p
        JOIN users u ON p.user_id = u.id
        WHERE p.gender = $3               -- Preference filter
        AND u.id != $4                    -- Self filter
        AND ST_DWithin(p.location, $1, 50000) -- 50km radius filter
        AND u.id NOT IN (                 -- Exclude already swiped
            SELECT receiver_id FROM swipes WHERE sender_id = $4
        )
        ORDER BY vibe_distance ASC        -- Rank by AI vibe
        LIMIT 10;
    `;

    const result = await pool.query(query, [
        userLocation,              // $1: Current user's geography point
        JSON.stringify(bio_vector), // $2: Current user's AI vector
        gender_preference,         // $3
        userId                     // $4
    ]);

    res.status(200).json({
        success: true,
        count: result.rows.length,
        profiles: result.rows
    });
});