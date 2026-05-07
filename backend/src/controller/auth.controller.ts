import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';
import { TryCatch } from '../utils/TryCatch.js';
import ErrorHandler from '../utils/errorHandler.js';

export const register = TryCatch (async(req , res , next) => {
        const { name, email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorHandler(400, "Missing fields: email and password are required"));
        }

        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (existingUser.length > 0) {
            // return next(new ErrorHandler(400, "Email already in use"));
            throw new ErrorHandler(400, "Email already in use");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (name , email , password) 
            VALUES ($1 , $2 , $3)
            RETURNING id,name,email`,
            [name,email,hashedPassword]
        );

        const user = result.rows[0];
        
        res.status(201).json({
            success: true,
            user
        });
});