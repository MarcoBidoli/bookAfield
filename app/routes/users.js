import { Router } from 'express';
import {getDB} from "../db.js";
import {ObjectId} from "mongodb";

const router = Router();

router.get("/:id", async function(req, res, next) {
    try {
        // TODO: Insert the following validation as middleware everytime /:id is used!!!
        /*if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid user ID format" });
        }*/

        const db = getDB();
        const userId = new ObjectId(req.params.id);

        let user = await db.collection("users").findOne({ _id: userId });
        if (!user) {
            return res.status(404).send({error: "User not found"});
        }
        const { password, createdAt, ...userWithoutPassword } = user;

        const tournaments = await db.collection("tournaments").find({
            creatorId: userId
        }).toArray();

        return res.send({
            user: userWithoutPassword,
            tournaments: tournaments
        });
    } catch (error) {
        next(error);
    }
});

router.get("/", async function(req, res, next) {
   try {
       const db = getDB();
       const search = req.query.q || "";

       const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
       const filter = search ? {
           $or: [
               {username: {$regex: escapeRegex(search), $options: "i"} },
               {name: {$regex: escapeRegex(search), $options: "i"} },
               {surname: {$regex: escapeRegex(search), $options: "i"} },
           ]
       } : {};

       const users = await db
           .collection("users")
           .find(filter)
           .project({ password: 0 })
           .toArray();

       return res.json(users);
   } catch (error) {
       next(error);
   }
});

export default router;