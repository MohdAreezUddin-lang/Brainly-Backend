import { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";

export const UserMiddleware = async (req:Request, res:Response, next:NextFunction) => {
    try{
        const token = req.headers.authorization; 
        const decode = jwt.verify(token as string, JWT_SECRET);
        if(decode) {
            //@ts-ignore
            req.userId = decode.id;
            next();
        } else {
            res.status(403).json({message:"Invalid, require Signup "})
        }
    }catch (e) {
        res.status(403).json({ message:"Invalid token" })
    }
}