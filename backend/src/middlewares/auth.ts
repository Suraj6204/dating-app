import { pool } from "../config/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"

export const isAuthenticated = TryCatch (async(req: Request, res: Response, next: NextFunction) => {
    //1.get token from cookies
    const {token} = req.cookies; //token -> user ka id hai
    if(!token){
        return next(new ErrorHandler(401 , "Please login to access"));
    }

    //2.verify the token and get id
    const decodedData = jwt.verify(token , process.env.JWT_SECRET as string) as JwtPayload

    //3.Check user exist in dB
    const result = await pool.query('SELECT id,name,email FROM users WHERE id=$1' , [decodedData.id]);
    const user = result.rows[0];

    if(!user){
        return next(new ErrorHandler(401, "User no longer exists"));
    }

    //4.Put user in req
    (req as any).user = user;

    next();
})