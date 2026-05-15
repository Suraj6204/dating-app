import { pool } from "../config/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import { profileSchema } from "../validators/profile.validator.js";

import { generateBioEmbedding } from "../services/ai.service.js";

export const updateProfile = TryCatch(async (req, res, next) => {
    const userId = (req as any).user.id;
    
    // 1. Zod Validation
    const { name, bio, gender, gender_preference, dob, interests, images, location } = profileSchema.parse(req.body);

    // 2. Identity Update (Users Table)
    if (name) {
        await pool.query(`UPDATE users SET name = $1 WHERE id = $2`, [name, userId]);
    }

    // 3. AI Embedding Generation
    const combinedText = `Bio: ${bio || ""}. Interests: ${interests.join(", ")}`;
    const vector = await generateBioEmbedding(combinedText);

    // 4. PostGIS & AI Upsert Logic (Profiles Table)
    // ST_SetSRID(ST_MakePoint(lng, lat), 4326) geometry create karega
    const {lat , long} = location;

    const query = `
        INSERT INTO profiles (
            user_id, bio, gender, gender_preference, dob, 
            interests, images, location, bio_vector
        ) 
        VALUES (
            $1, $2, $3, $4, $5, 
            $6, $7, ST_SetSRID(ST_MakePoint($8, $9), 4326), $10
        )
        ON CONFLICT (user_id) DO UPDATE SET 
            bio = EXCLUDED.bio,   
            gender = EXCLUDED.gender,
            gender_preference = EXCLUDED.gender_preference,
            dob = EXCLUDED.dob,
            interests = EXCLUDED.interests,
            images = EXCLUDED.images,
            location = EXCLUDED.location,
            bio_vector = EXCLUDED.bio_vector,
            updated_at = CURRENT_TIMESTAMP
        RETURNING *;
    `;

    const result = await pool.query(query, [
        userId, 
        bio, 
        gender, 
        gender_preference, 
        dob, 
        interests, 
        images, 
        location.long, // $8: Longitude first for ST_MakePoint
        location.lat, // $9: Latitude second
        JSON.stringify(vector) // $10: AI Vector
    ]);

    if (!result || result.rows.length === 0) {
        return next(new ErrorHandler(500, "Profile update failed"));
    }

    const profile = result.rows[0];
    
    // 5. Response formatting
    const profileWithMainPic = {
        ...profile,
        profile_pic: (profile.images && profile.images.length > 0) ? profile.images[0] : null
    };

    res.status(200).json({
        success: true,
        message: "Profile and Vibe updated successfully",
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