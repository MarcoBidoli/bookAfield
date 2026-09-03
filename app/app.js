import express from "express";
import passport from "passport";
import path from "path";
import {fileURLToPath} from "url";
import compression from "compression";
import helmet from "helmet";
import "./config/passport.js";

import authRouter from "./routes/auth.js";
import fieldsRouter from "./routes/fields.js";
import tournamentsRouter from "./routes/tournaments.js";
import matchesRouter from "./routes/matches.js";
import usersRouter from "./routes/users.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(passport.initialize());

// Production Security & Performance Middleware (Only active in production)
if (process.env.NODE_ENV === "production") {
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());
}

// API Route Mounts
app.use("/api/auth", authRouter);
app.use("/api/fields", fieldsRouter);
app.use("/api/tournaments", tournamentsRouter);
app.use("/api/matches", matchesRouter);
app.use("/api/users", usersRouter);

app.get("/api/whoami", (req, res, next) => {
  passport.authenticate("jwt", (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return res.status(401).json({
        error: info?.message || "Unauthorized",
      });
    }

    return res.status(200).json({
      user,
    });
  })(req, res, next);
});


// PRODUCTION STATIC FILES & SPA FALLBACK
if (process.env.NODE_ENV === "production") {
  // Serve optimized Vue build files
  app.use(
    express.static(path.join(__dirname, "../frontend/dist"), {
      maxAge: "1y",
      etag: true,
    }),
  );

  // Vue SPA Fallback (Express 5 syntax)
  app.get("/*splat", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
} else {
  // Development / Test root route
  app.get("/", (req, res) => {
    res.send("Hello bookAfield!");
  });
}

// Error handler
app.use((err, req, res) => {
  if (
    err.name === "BSONError" ||
    err.message?.includes("Argument passed in must be a string of 12 bytes")
  ) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
