import express from "express";
import {getDB} from "../db.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const db = getDB();
        const search = req.query.q || "";

        const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const filter = search ? {
                $or: [
                    {name: {$regex: escapeRegex(search), $options: "i"}},
                    {address: {$regex: escapeRegex(search), $options: "i"}}
                ]
            }
            : {};

        const fields = await db.collection("fields").find(filter).toArray();
        res.json(fields);
    } catch (err) {
        next(err);
    }
});

 export default router;