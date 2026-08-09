import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import {getDB} from "../db.js";
import bcrypt from "bcryptjs";

const router = express.Router();

router.post("/signup", async (req, res, next) => {
    try {
        const {username, password, name, surname} = req.body;

        if (!username || !password) {
            return res.status(400).json({error:"Please send username, password, name, surname"});
        }

        const db = getDB();
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {username, password: hashedPassword, name, surname, createdAt: new Date()};

        await db.collection("users").insertOne(newUser);

        res.status(201).json({message: "User successfully registered"});
    } catch (err) {
        if(err.code === 11000) { //MongoDB unique index violation
            return res.status(409).json({error:"User already exist"});
        }
        next(err);
    }
});

router.post('/signin', (req, res, next) => {
    // passport custom callback to handle response
    // session: false avoid storing cookies with session info
    passport.authenticate('local', {session: false}, (err, user, info) => {
        if (err) {
            return next(err); // Server or Database error
        }
        if (!user) {
            // `?.` op returns info if not null
            return res.status(401).json({error: info?.message || 'Unauthorized'});
        }

        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Removing password from user before sending response
        const{ password, ...sanitizedUser } = user; // all  user fields but password

        res.json({
            token,
            user: sanitizedUser
        });
    })(req, res, next); // passport.authenticate() returns an Express middleware function. Placing (req, res, next) at the end executes that middleware immediately with the current request objects
});

router.get("/whoami", passport.authenticate("jwt", { session: false }), (req, res) => {
    res.json(req.user);
});

export default router;