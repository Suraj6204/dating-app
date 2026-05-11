import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';
import { TryCatch } from '../utils/TryCatch.js';
import ErrorHandler from '../utils/errorHandler.js';
import { loginSchema, signupSchema } from '../validators/auth.validator.js';
import { sendToken } from '../utils/sendToken.js';


export const register = TryCatch (async(req , res , next) => {
    const validatedData = signupSchema.parse(req.body);
    const { name, email, password } = validatedData;

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
        return next(new ErrorHandler(400, "Email already in use"));
        // throw new ErrorHandler(400, "Email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO users (name , email , password) 
        VALUES ($1 , $2 , $3)
        RETURNING id,name,email`,
        [name,email,hashedPassword]
    );

    const user = result.rows[0];
    
    sendToken(user, 201, res, "User registered successfully");
});

export const login = TryCatch (async(req , res , next) => {
    // const validatedData = loginSchema.parse(req.body);
    const { email, password } = loginSchema.parse(req.body);

    //1.check if user exist
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = result.rows[0];
    if(!user){
        throw new ErrorHandler(401 , "User not exist, Please register first!");
    }

    //2.check password match(newpass , oldpass)
    const isMatch = await bcrypt.compare(password , user.password);
    if(!isMatch){
        throw new ErrorHandler(401, "Invalid email or password");
    }

    //3.Generate JWT 
    sendToken(user,200,res,`Welcome back, ${user.name}`)

});

export const logout = TryCatch (async(req , res , next) => {
    const cookieOptions = {
        expires: new Date(Date.now()), // turant expire
        httpOnly: true, // Frontend JS ise read nahi kar payegi
        secure: process.env.NODE_ENV === "production", // Sirf HTTPS par chalega
        sameSite: "strict" as const, // CSRF protection ke liye
    };

    res.status(200).cookie("token", "" , cookieOptions).json({
        success:true,
        message:"Logout Successfully"
    })
});