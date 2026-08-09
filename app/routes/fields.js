import express from "express";
import {getDB} from "../db.js";
import {ObjectId} from "mongodb";
import passport from "passport";

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

router.post("/:id/bookings", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
    try {
        const {date, slot, type = "standard"} = req.body;
        const fieldId = new ObjectId(req.params.id);
        const db = getDB();

        // Field existence
        const field = await db.collection("fields").findOne({_id: new ObjectId(fieldId)});
        if (!field || !field.slots.includes(slot)) {
            return res.status(400).json({error: "Invalid field or slot"});
        }

        // future booking
        const bookingDateTime = new Date(`${date}T${slot.split('-')[0]}`);
        if (bookingDateTime <= Date.now()) {
           return res.status(400).json({error: "Booking date must be in the future"});
        }

        // insert booking
        const newBooking = {
            fieldId,
            userId: req.user._id, // set by passport-jwt
            date,
            slot,
            type, // normal or tournament only
            createdAt: new Date()
        }

        const result = await db.collection("bookings").insertOne(newBooking);
        res.status(201).json({
            _id: result.insertedId.toString(),
            ...newBooking
        });
    } catch (err) {
        // MongoDB compound unique index violation
        if(err.code === 11000) {
            return res.status(409).json({error: "This slot is already booked"});
        }
        next(err);
    }
});

export default router;