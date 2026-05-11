import mongoose, { model, Schema, Types } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const UserSchema = new Schema({
    username: { type:String, required:true, unique:true },
    password: {type:String, required:true },
    email:{ type:String, required:true}
})

const TagSchema = new Schema({
    title: { type:String, required:true, unique:true },
})

const LinkSchema = new Schema({
    hash: { type:String, required:true},
    userId: { type:Types.ObjectId, ref:'User', required:true, unique:true }
})

const context = [ 'youtube','twitter', 'instagram' ]
const ContentSchema = new Schema({
    link: { type:String, required:true },
    type: { type:String, enum:context, required:true },
    title: { type:String, required:true },
    tags: [{ type:Types.ObjectId, ref:'Tag', required:false }],
    userId: { type:Types.ObjectId, ref:'User', required:true }
})

mongoose.connect(process.env.MONGOOSE_URL!)

export const UserModel = model('User', UserSchema);
export const TagModel = model('Tag', TagSchema);
export const LinkModel = model('Link', LinkSchema);
export const ContentModel = model('Content', ContentSchema);
