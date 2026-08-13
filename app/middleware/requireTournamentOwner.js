import {getDB} from "../db.js";
import {ObjectId} from "mongodb";

export async function requireTournamentOwner(req, res, next) {
    try {
        const db = getDB();

        const match = await db.collection("matches").findOne({ _id: new ObjectId(req.params.id) });
        if (!match) return res.status(404).json({ error: "Match not found" });

        const tournament = await db.collection("tournaments").findOne({_id: match.tournamentId });
        if (!tournament) return res.status(404).json({error: "Tournament not found"});

        if (tournament.creatorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({error: "Only the tournament creator can submit results" });
        }

        req.match = match;
        req.tournament = tournament;

        next();
    } catch (error) {
        next(error);
    }
}