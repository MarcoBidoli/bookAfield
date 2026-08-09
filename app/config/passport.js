import passport from "passport";
import passportLocal from "passport-local";
import passportJwt from "passport-jwt";
import bcrypt from "bcryptjs";
import {getDB} from "../db.js";
import {ObjectId} from "mongodb";

const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

passport.use(
    new LocalStrategy({
            usernameField: "username",
            passwordField: "password"
        },
        async (username, password, done) => {
            try {
                const db = await getDB();

                const user = await db.collection("users").findOne({ username });
                if(!user) {
                    // done(null, false) indicates authentication failed
                    return done(null, false, {message: "Invalid credentials"});
                }

                const isMatch = await bcrypt.compare(password, user.password);
                if(!isMatch) {
                    return done(null, false, {message: "Invalid credentials"});
                }
                return done(null, user); // successfully authenticated, return user object
            } catch (error) {
                return done(error);
            }
        })
);

passport.use(
    new JwtStrategy(
        {
            // Extract the JWT from the "Authorization: Bearer <TOKEN>" header
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET
        },
        async (jwtPayload, done) => {
            try {
                const db = getDB();

                // Find the user associated with the ID in the JWT payload
                const user = await db.collection("users").findOne(
                    { _id: new ObjectId(jwtPayload.userId) },
                    { projection: { password: 0 } } // avoid sending back the password has
                );

                if (!user) {
                    return done(null, false); // User not found
                }

                return done(null, user); // User verified, passed to req.user
            } catch (error) {
                return done(error, false);
            }
        }
    )
);