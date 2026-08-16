import express from 'express';
import passport from "passport";
import {getDB} from "../db.js";
import {ObjectId} from "mongodb";
import {requireTournamentOwner} from "../middleware/requireTournamentOwner.js";

const router = express.Router();

router.get("/:id", async (req, res, next) => {
    try {
        const db = getDB();
        const match = await db.collection("matches").findOne({ _id: new ObjectId(req.params.id) });
        if (!match) {
            return res.status(404).send("Match not found");
        }
        res.json(match);
    } catch (error) {
        next(error);
    }
});

router.put(
    "/:id/result",
    passport.authenticate("jwt", { session: false }),
    requireTournamentOwner,
    async (req, res, next) => {
    try {
        const {scoreA, scoreB} = req.body;

        if (scoreA === undefined || scoreB === undefined) {
            return res.status(400).json({error: "scoreA and scoreB are required"});
        }

        const db = getDB();
        const matchId = new ObjectId(req.params.id);

        const match = req.match;
        if (!match) return res.status(404).json({error: "Match not found"});

        // match must be scheduled
        if (!match.date || !match.slot) {
            return res.status(400).json({error: "Cannot record result for unscheduled match"});
        }

        // no draws for volleyball and basketball
        const tournament = req.tournament;
        if (Number(scoreA) === Number(scoreB) && ["volleyball", "basketball"].includes(tournament.sport)) {
            return res.status(400).json({error: `Draws are not permitted in ${tournament.sport}`});
        }

        // match date must have passed or be today
        if (new Date(match.date) > new Date()) {
            return res.status(400).json({ error: "Cannot record result for future match" });
        }

        // update results and mark as played
        const updatedMatch = await db.collection("matches").findOneAndUpdate(
            { _id: matchId },
            {
                $set: {
                    status: "played",
                    result: { scoreA: Number(scoreA), scoreB: Number(scoreB) }
                }
            }
        );

        res.json(updatedMatch);
    } catch (error) {
        next(error);
    }
});

// not in project specifications, used to map bookings with matches
router.patch(
    "/:id/bookings",
    passport.authenticate("jwt", { session: false }),
    requireTournamentOwner,
    async (req, res, next) => {
        try {
            const db = getDB();

            const match = req.match;
            const tournament = req.tournament;

            if (!match) {
                return res.status(404).json({
                    error: "Match not found"
                });
            }

            if (!tournament) {
                return res.status(404).json({
                    error: "Tournament not found"
                });
            }

            const { bookingId } = req.body;

            if (!bookingId) {
                return res.status(400).json({
                    error: "bookingId is required"
                });
            }

            let bookingObjectId;

            try {
                bookingObjectId = new ObjectId(bookingId);
            } catch {
                return res.status(400).json({
                    error: "Invalid bookingId"
                });
            }

            // The booking must belong to this tournament.
            const booking = await db.collection("bookings").findOne({
                _id: bookingObjectId,
                tournamentId: tournament._id,
                type: "tournament"
            });

            if (!booking) {
                return res.status(400).json({
                    error: "Booking does not belong to this tournament"
                });
            }

            // Assign the booking to the match.
            // Multiple matches are allowed to reference the same booking.
            await db.collection("matches").updateOne(
                { _id: match._id },
                {
                    $set: {
                        bookingId: booking._id,
                        fieldId: booking.fieldId,
                        date: booking.date,
                        slot: booking.slot
                    }
                }
            );

            const updatedMatch = await db.collection("matches").findOne({
                _id: match._id
            });

            res.json(updatedMatch);

        } catch (error) {
            next(error);
        }
    }
);

export default router;