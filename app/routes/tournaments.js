import {Router} from 'express';
import {getDB} from "../db.js";
import passport from "passport";
import {ObjectId} from "mongodb";
import {requireOwner} from "../middleware/requireOwner.js";
import {requireTournamentState} from "../middleware/requireTournamentState.js";

const router = Router();

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.get('/', async (req, res, next) => {
    try {
        const db = getDB();
        const query = escapeRegExp(req.query.q || "");

        const filter = query ? {
            $or: [
                {name: {$regex: query, $options: "i"}},
                {"teams.name": {$regex: query, $options: "i"}},
                {"teams.players.name": {$regex: query, $options: "i"}},
                {"teams.players.surname": {$regex: query, $options: "i"}},
            ]
        } : {};

        const tournaments = await db.collection("tournaments")
            .aggregate([
                {
                    $match: filter
                },
                {
                    $addFields: {
                        statusOrder: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ["$status", "active"] }, then: 1 },
                                    { case: { $eq: ["$status", "registration"] }, then: 2 },
                                    { case: { $eq: ["$status", "completed"] }, then: 3 }
                                ],
                                default: 4
                            }
                        }
                    }
                },
                {
                    $sort: {
                        statusOrder: 1,
                        _id: 1
                    }
                },
                {
                    $project: {
                        statusOrder: 0
                    }
                }
            ])
            .toArray();

        res.json(tournaments);
    } catch (error) {
        next(error);
    }
});

router.post('/', passport.authenticate("jwt", { session: false}), async (req, res, next) => {
    try {
        const {name, sport, maxTeams, startDate} = req.body;
        if (!name || !sport || !maxTeams || !startDate) {
            return res.status(400).json({error: "Missing required fields"});
        }

        const db = getDB();
        const newTournament = {
            creatorId: req.user._id,
            name,
            sport,
            maxTeams: Number(maxTeams),
            startDate,
            status: "registration",
            teams: [],
            createdAt: new Date()
        };

        const result = await db.collection("tournaments").insertOne(newTournament);
        res.status(201).json({_id: result.insertedId, ...newTournament});
    } catch (error) {
        next(error);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const db = getDB();
        const tournament = await db.collection("tournaments").findOne({ _id: new ObjectId(req.params.id) });
        if (!tournament) return res.status(404).json({error: "Tournament not found"});
        res.json(tournament);
    } catch (error) {
        next(error);
    }
});

router.put(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    requireOwner("tournaments"),
    requireTournamentState(["registration"]),
    async (req, res, next) => {
        try {
            const db = getDB();
            const { name, maxTeams, startDate, teams } = req.body;

            const updateData = {};

            if (typeof name === "string") updateData.name = name.trim();

            if (maxTeams !== undefined) {
              const parsedMax = Number(maxTeams);
              if (Number.isNaN(parsedMax) || parsedMax < 2) {
                return res.status(400).json({
                  error: "Invalid maxTeams value",
                });
              }

              // Do not allow the maximum team smaller than the number of teams already registered.
              if (Array.isArray(req.resource.teams) && req.resource.teams.length > parsedMax) {
                return res.status(400).json({
                  error:
                    "maxTeams cannot be lower than the current number of teams",
                });
              }

              updateData.maxTeams = parsedMax;
            }

            if (startDate && !Number.isNaN(Date.parse(startDate))) {
                updateData.startDate = startDate;
            }

            if (Array.isArray(teams)) {
                const targetMaxTeams = updateData.maxTeams || req.resource.maxTeams;
                if (teams.length > targetMaxTeams) {
                    return res.status(400).json({ error: "Teams count exceeds maxTeams limit" });
                }

                // Sanitize nested team and player objects strictly
                updateData.teams = teams.map((team) => ({
                    _id: team._id ? new ObjectId(team._id) : new ObjectId(),
                    name: String(team.name || "").trim(),
                    players: Array.isArray(team.players)
                        ? team.players.map((player) => ({
                            userId: new ObjectId(player.userId),
                            name: String(player.name || "").trim(),
                            surname: String(player.surname || "").trim(),
                            jerseyNumber:
                                player.jerseyNumber !== undefined && player.jerseyNumber !== null
                                    ? String(player.jerseyNumber).trim()
                                    : null,
                        }))
                        : [],
                }));
            }

            const updated = await db
                .collection("tournaments")
                .findOneAndUpdate(
                    { _id: req.resource._id },
                    { $set: updateData },
                    { returnDocument: "after" }
                );

            res.json(updated);
        } catch (error) {
            next(error);
        }
    }
);

router.delete(
    '/:id',
    passport.authenticate("jwt", { session: false}),
    requireOwner("tournaments"),
    async (req, res, next) => {
        try {
            const db = getDB();
            const tournamentId = req.resource._id;

            // matches of this tournament
            const matches = await db.collection("matches").find({tournamentId}).toArray();
            const matchIds = matches.map(m => m._id);

            // remove booking of tournament matches
            await db.collection("bookings").deleteMany({matchId: { $in: matchIds} });

            // delete matches
            await db.collection("matches").deleteMany({ tournamentId });

            // delete tournament
            await db.collection("tournaments").deleteOne({ _id: tournamentId });

            res.json({message: "Tournament and all dependencies deleted successfully"});
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/:id/matches/generate",
    passport.authenticate("jwt", { session: false}),
    requireOwner("tournaments"),
    requireTournamentState(["registration"]),
    async (req, res, next) => {
        try {
            const tournament = req.resource;

            if (tournament.teams.length !== tournament.maxTeams) {
                return res.status(400).json({error: "Cannot generate schedule until all teams are registered"});
            }

            const teams = [...tournament.teams];
            if (teams.length % 2 !== 0) {
                teams.push( {_id: null, name: "BYE"});
            }

            const N = teams.length;
            const rounds = N-1;
            const matches = [];

            for (let round = 1; round <= rounds; round++) {
                for (let i = 0; i < N/2; i++) {
                    const home = teams[i];
                    const away = teams[N - 1 - i];

                    matches.push({
                        tournamentId: tournament._id,
                        teamA: home._id,
                        teamB: away._id,
                        teamAName: home.name,
                        teamBName: away.name,
                        round,
                        status: "upcoming",
                        fieldId: null,
                        date: null,
                        slot: null,
                        bookingId: null,
                        result: null
                    });
                }
                teams.splice(1, 0, teams.pop());
            }

            const db = getDB();
            await db.collection("matches").insertMany(matches);

            // set tournament status to 'active'
            await db.collection("tournaments").updateOne(
                { _id: tournament._id },
                { $set: { status: "active" } }
            );

            res.status(201).json({message: "Schedule generated successfully", count: matches.length});
        } catch (error) {
            next(error);
        }
    }
);

router.get("/:id/standings", async (req, res, next) => {
   try {
       const db = getDB();
       const tournamentId = new ObjectId(req.params.id);

       const tournament = await db.collection("tournaments").findOne({ _id: tournamentId });
       if (!tournament) return res.status(404).json({error: "Tournament not found"});

       const playedMatches = await db.collection("matches").find({
           tournamentId,
           status: "played"
       }).toArray();

       // standing stats foreach tournament team
       const standingsMap = {};
       for (const team of tournament.teams) {
           standingsMap[team._id.toString()] = {
               teamId: team._id,
               name: team.name,
               points: 0,
               played: 0,
               won: 0,
               lost: 0,
               drawn: 0,
               scored: 0,
               conceded: 0,
               diff: 0
           };
       }

       // calculate standings iterating through matches
       for (const match of playedMatches) {
           const {teamA, teamB, result} = match;
           if (!teamA || !teamB || !result) continue;

           const statsA = standingsMap[teamA.toString()];
           const statsB = standingsMap[teamB.toString()];

           if (!statsA || !statsB) continue;

           statsA.played += 1;
           statsB.played += 1;

           statsA.scored += result.scoreA;
           statsA.conceded += result.scoreB;
           statsB.scored += result.scoreB;
           statsB.conceded += result.scoreA;

           if(result.scoreA > result.scoreB) {
               statsA.won += 1;
               statsB.lost += 1;

               // Football: 3 points, basketball/volleyball: 2 points
               statsA.points += tournament.sport === "football" ? 3 : 2;

           } else if (result.scoreB > result.scoreA) {
               statsB.won += 1;
               statsA.lost += 1;

               statsB.points += tournament.sport === "football" ? 3 : 2;
           } else {
               statsA.drawn += 1;
               statsB.drawn += 1;
               if (tournament.sport === "football") {
                   statsA.points += 1;
                   statsB.points += 1;
               }
           }

           // Goal/point difference
           statsA.diff = statsA.scored - statsA.conceded;
           statsB.diff = statsB.scored - statsB.conceded;
       }

       const standings = Object.values(standingsMap).sort((a, b) => {
           if (b.points !== a.points) {
               return b.points - a.points;
           }

           if (b.diff !== a.diff) {
               return b.diff - a.diff;
           }

           return b.scored - a.scored;
       });

       res.json(standings);
   } catch (error) {
       next(error);
   }
});

router.get("/:id/matches", async (req, res, next) => {
   try {
       const db = getDB();
       const tournamentId = new ObjectId(req.params.id);

       const matches = await db.collection("matches")
           .aggregate([
               {
                   $match: {
                       tournamentId
                   }
               },
               {
                   $lookup: {
                       from: "bookings",
                       localField: "bookingId",
                       foreignField: "_id",
                       as: "booking"
                   }
               },
               {
                   $unwind: {
                       path: "$booking",
                       preserveNullAndEmptyArrays: true
                   }
               },
               {
                   $lookup: {
                       from: "fields",
                       localField: "fieldId",
                       foreignField: "_id",
                       as: "field"
                   }
               },
               {
                   $unwind: {
                       path: "$field",
                       preserveNullAndEmptyArrays: true
                   }
               },
               {
                   $sort: {
                       round: 1
                   }
               }
           ])
           .toArray();

       res.json(matches);
   } catch (error) {
       next(error);
   }
});

// Not in the project details, added to manage somehow the association tournament bookings <-> match
router.get(
    "/:id/bookings",
    passport.authenticate("jwt", { session: false }),
    requireOwner("tournaments"),
    async (req, res, next) => {
        try {
            const db = getDB();
            const tournamentId = req.resource._id;

            const bookings = await db.collection("bookings")
                .aggregate([
                    {
                        $match: {
                            tournamentId,
                            type: "tournament"
                        }
                    },
                    {
                        $lookup: {
                            from: "fields",
                            localField: "fieldId",
                            foreignField: "_id",
                            as: "field"
                        }
                    },
                    {
                        $unwind: {
                            path: "$field",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $sort: {
                            date: 1,
                            slot: 1
                        }
                    }
                ])
                .toArray();

            res.json(bookings);
        } catch (error) {
            next(error);
        }
    }
);

export default router;