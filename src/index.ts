import express from "express";
import { ContentModel, UserModel } from "./db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";
import { UserMiddleware } from "./middleware";

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
      const token = jwt.sign(
        {
          id: user._id,
        },
        JWT_SECRET,
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

    await ContentModel.create({
        title,
        type,
        link,
        tags,
        // @ts-ignore
        userId:req.userId
    })

    res.status(200).json({ message:"content created "})
});

// Get all document content
app.get("/api/v1/content", UserMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    await ContentModel.findOne({
        userId:userId
    }).populate("userId","username")
    res.json({message:"Recevied"})
});

// Delete a document
app.delete("/api/v1/content",UserMiddleware, async (req, res) => {
    const creatorId = req.body.creatorId;
    await ContentModel.deleteMany({
        creatorId,
        // @ts-ignore
        userId:req.userId
    })
});

// Create a shareable link
app.post("/api/v1/brain/share", (req, res) => {});

// Share another user's Shareable link
app.get("/api/v1/brain/:shareLink", (req, res) => {});


app.listen(3000);