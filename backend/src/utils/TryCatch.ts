import { Request, Response, NextFunction, RequestHandler } from "express";

export const TryCatch = (controller: (req:Request , res:Response , next:NextFunction) => Promise<any>): RequestHandler =>
    (req,res,next)=>{
        Promise.resolve(controller(req, res, next)).catch(next);
    }

