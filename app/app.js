import express from "express";
import passport from "passport";
import "./config/passport.js";

import authRouter from "./routes/auth.js";
import fieldsRouter from "./routes/fields.js";
import tournamentsRouter from "./routes/tournaments.js";
import matchesRouter from "./routes/matches.js";
import usersRouter from "./routes/users.js";

const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(passport.initialize());

// route mounts
app.use("/api/1.0/auth", authRouter);
app.use("/api/1.0/fields", fieldsRouter);
app.use("/api/1.0/tournaments", tournamentsRouter);
app.use("/api/1.0/matches", matchesRouter);
app.use("/api/1.0/users", usersRouter);

// Error handler to avoid non ObjectId params (e.g. tournaments/123 instead of tournaments/6a784646e136ccd82438cee2)
app.use((err, req, res, next) => {
    // Catch MongoDB's invalid ObjectId instantiation error
    if (err.name === "BSONError" || err.message?.includes("Argument passed in must be a string of 12 bytes")) {
        return res.status(400).json({ error: "Invalid ID format" });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});

// root route
app.get("/", (req, res) => {
    res.send("Hello bookAfield!");
});

export default app;