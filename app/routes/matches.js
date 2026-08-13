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

export default router;