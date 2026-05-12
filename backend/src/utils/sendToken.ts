import {Request , Response} from 'express'
import jwt from 'jsonwebtoken'

export const sendToken = (user:any ,statusCode:number , res:Response , message:string) => {
    const token = jwt.sign(
        {id:user.id}, //taki isse user db se laa paye isAuth middleware me
        process.env.JWT_SECRET as string,
        {expiresIn: "7d"}
    );

    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 din
        httpOnly: true, // Frontend JS ise read nahi kar payegi
        secure: process.env.NODE_ENV === "production", // Sirf HTTPS par chalega
        sameSite: "strict" as const, // CSRF protection ke liye
    };

    res.status(statusCode).cookie("token", token , cookieOptions).json({
        success:true,
        message,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    })
}