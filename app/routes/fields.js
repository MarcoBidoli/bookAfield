import express from "express";
import {getDB} from "../db.js";
import {ObjectId} from "mongodb";

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

router.get("/:id", async (req, res, next) => {
    try {
        const db = getDB();
        const field = await db.collection("fields").findOne({_id: new ObjectId(req.params.id)});

        if (!field) {
            return res.status(404).json({error: "Field not found"});
        }
        res.json(field);
    } catch (err) {
        next(err);
    }
});

router.get("/:id/slots", async (req, res, next) => {
    try {
        const {date} = req.query; // "YYYY-MM-DD" expected
        if(!date) {
            return res.status(400).json({error: "Date query parameter is required"});
        }

        const db = getDB();
        const fieldId = new ObjectId(req.params.id);

        const field = await db.collection("fields").findOne({_id: new ObjectId(req.params.id)});
        if (!field) {
            return res.status(404).json({error: "Field not found"});
        }

        const bookings = await db.collection("bookings").find({fieldId: fieldId, date: date}).toArray();
        const bookedSlots = bookings.map(b => b.slot);

        const availableSlots = field.slots.map(slot => ({
            slot,
            available: !bookedSlots.includes(slot)
        }));

        res.json(availableSlots);
    } catch (err) {
        next(err);
    }
});

export default router;