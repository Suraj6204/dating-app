import { pool } from "../config/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import { profileSchema } from "../validators/profile.validator.js";

export const updateProfile = TryCatch(async(req , res , next) => {
    const userId = (req as any).user.id;
    const { name , bio, gender, gender_preference, dob, interests, images, location } = profileSchema.parse(req.body);

    if(name){
        await pool.query(`UPDATE users SET name = $1 WHERE id = $2` , [name,userId]);
    }
    //EXCLUDED is a special temporary table 
    //EXCLUDED.bio: Iska matlab hai "Wo naya bio jo humne insert karne ke liye bheja tha."
    const query = `
        INSERT INTO profiles (user_id, bio, gender, gender_preference, dob, interests, images, location) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (user_id) DO UPDATE SET 
            bio = EXCLUDED.bio,   
            gender = EXCLUDED.gender,
            gender_preference = EXCLUDED.gender_preference,
            dob = EXCLUDED.dob,
            interests = EXCLUDED.interests,
            images = EXCLUDED.images, -- Array pure ka pura update hoga
            location = EXCLUDED.location,
            updated_at = CURRENT_TIMESTAMP
        RETURNING *;
    `

    const result = await pool.query(query , [userId, bio, gender, gender_preference, dob, interests, images, JSON.stringify(location)]);
    if (!result || !result.rows || result.rows.length === 0) {
        return next(new ErrorHandler(401, "User no longer exists"));
    }
    const profile = result.rows[0];
    const profileWithMainPic = {
        ...profile,
        profile_pic: profile.images[0]
    }

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        profile: profileWithMainPic
    });
});

export const getMyProfile = TryCatch(async(req , res , next) => {
    const userId = (req as any).user.id;
    const result = await pool.query(`SELECT * FROM profiles WHERE user_id = $1` , [userId]);
    
    if (result.rows.length === 0) {
        return next(new ErrorHandler(404, "Profile not found"));
    }

    res.status(200).json({
        success: true,
        profile: result.rows[0]
    });
});