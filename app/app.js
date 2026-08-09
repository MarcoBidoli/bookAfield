import express from "express";
import passport from "passport";
import "./config/passport.js";

import authRouter from "./routes/auth.js";

const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(passport.initialize());

// route mounts
app.use("/api/1.0/auth", authRouter);

// root route
app.get("/", (req, res) => {
    res.send("Hello bookAfield!");
});

export default app;