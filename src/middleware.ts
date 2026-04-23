import { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const UserMiddleware = async (req:Request, res:Response, next:NextFunction) => {
    try{
        const token = req.headers.authorization;
        const secret = process.env.JWT_SECRET;
        if (!token || !secret) {
            return res.status(403).json({ message: "Invalid token" });
        }
        const decode = jwt.verify(token, secret) as jwt.JwtPayload;
        if (decode) {
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