import express from "express";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

import { ContentModel, LinkModel, UserModel } from "./db";
import { UserMiddleware } from "./middleware";
import { getRandomString } from "./utils";

dotenv.config();
const app = express();
app.use(express.json());

// Signup
app.post("/api/v1/signup", async (req, res) => {
    try {
        const { username, password } = req.body;

    const existingUser = await UserModel.findOne({ username });

    if (existingUser) {
      return res
        .status(409)
        .json({
          message:
            "User already exists",
        });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      username,
      password: hashedPassword,
    });

    if (user) {
      return res.status(200).json({ message: "User signedup" });
    }
  } catch (err) {
    res.status(500).json({ message: "internal server issue" });
  }
});

// Signin
app.post("/api/v1/signin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await UserModel.findOne({
      username,
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User doesnot exist, please signup" });
    }

    const matchPassword = await bcrypt.compare(password, user.password);

    if (matchPassword) {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return res.status(500).json({ message: "JWT secret not configured" });
      }

      const token = jwt.sign(
        {
          id: user._id,
        },
        jwtSecret,
      );
      res.status(200).json({
        token: token,
      });
    } else {
      res.status(403).json({
        message: "Invalid credentials",
      });
    }
  } catch (e) {
    res.status(500).json({ message: "Internal server issue" });
  }
});

// Create content
app.post("/api/v1/content",UserMiddleware, async (req, res) => {

    const { title, type, link, tags } = req.body;

    const content = await ContentModel.create({
        title,
        type,
        link,
        tags,
        // @ts-ignore
        userId:req.userId
    })

    if(!content) {
      res.status(500).json({
        message:"You have missed something, like giving title or etc"
      })
    }

    res.status(200).json({ message:"content created "})
});

// Get all document content
app.get("/api/v1/content", UserMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const content = await ContentModel.find({
        userId:userId
    }).populate("userId","username")
    res.json({
      content
    })
});

// Delete a document
app.delete("/api/v1/content", UserMiddleware, async (req, res) => {
    const creatorId = req.body.creatorId;
    await ContentModel.deleteOne({
        creatorId,
        // @ts-ignore
        userId:req.userId
    })
    res.json({ message: "Content deleted"})
});

// Create a shareable link
app.post("/api/v1/brain/share", UserMiddleware, async (req, res) => {
    const { share } = req.body;
    
    if(share){
    const existinLink = await LinkModel.findOne({
      //@ts-ignore
      userId:req.userId
    })

    if(existinLink) {
      res.json({
        //@ts-ignore
        message:"Link already exists " + existinLink.hash

      })
      return;
    }

      const hash = getRandomString(10);
      await LinkModel.create({
        //@ts-ignore
        userId:req.userId,
        hash:hash
      })
      res.json({ 
        message:"Shareable link created "
         + hash
      })
    } else {
      await LinkModel.deleteOne({
        //@ts-ignore
        userId:req.userId
      })
      res.json({
        message:"Link deleted"
      })
    }
});

// Share link to another user
app.get("/api/v1/brain/:shareLink", UserMiddleware, async (req, res) => {
    const hash = req.params.shareLink;

    const link = await LinkModel.findOne({
      hash
    })

    if(!link) {
      res.json({
        message:"Invalid input"
      })
      return;
    }

    
    const user = await UserModel.findOne({
      _id:link.userId
    })
    
    if(!user) {
      res.json({
        message:"Invalid, user not found"
      })
      return;
    }
    
    const content = await ContentModel.find({
      userId:link.userId
    })
    res.json({
      username:user.username,
      content:content
    })

});


app.listen(process.env.PORT);