import {Router} from 'express';
import {getDB} from "../db.js";
import {ObjectId} from "mongodb";
import passport from "passport";

const router = Router();

// Added because of missing functionality even if not in the project specs
router.get("/:id/bookings", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
    try {
        const db = getDB();
        const targetUserId = new ObjectId(req.params.id);

        // Ensure users can only view their own bookings
        if (req.user._id.toString() !== targetUserId.toString()) {
            return res.status(403).json({ error: "Unauthorized to view these bookings" });
        }

        const bookings = await db.collection("bookings")
            .aggregate([
                { $match: { userId: targetUserId } },
                {
                    $lookup: {
                        from: "fields",
                        localField: "fieldId",
                        foreignField: "_id",
                        as: "fieldDetails"
                    }
                },
                {
                    $unwind: {
                        path: "$fieldDetails",
                        preserveNullAndEmptyArrays: true
                    }
                },
                { $sort: { date: 1, slot: 1 } }
            ])
            .toArray();

        res.json(bookings);
    } catch (err) {
        next(err);
    }
});

router.get("/:id", async function(req, res, next) {
    try {
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