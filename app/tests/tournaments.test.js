import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import app from "../app.js";
import {closeDB, connectDB, getDB} from "../db.js";

describe("Tournaments, Matches & Standings API Integration Tests", () => {
    let db;
    let ownerToken = "";
    let ownerId = "";
    let otherUserToken = "";
    let otherUserId = "";
    const tournamentIds = [];

    const getFutureDate = (daysAhead = 10) => {
        const d = new Date();
        d.setDate(d.getDate() + daysAhead);
        return d.toISOString().split("T")[0];
    };

    const getPastDate = (daysAgo = 1) => {
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        return d.toISOString().split("T")[0];
    };

    const createUser = async (prefix, name, surname) => {
        const username = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const password = "Password123!";
        await request(app).post("/api/auth/signup").send({ username, password, name, surname }).expect(201);
        const auth = await request(app).post("/api/auth/signin").send({ username, password }).expect(200);
        return { token: auth.body.token, userId: jwt.decode(auth.body.token).userId, username };
    };

    const createTournament = async ({ token = ownerToken, name = `Test Tournament ${Date.now()}`, sport = "football", maxTeams = 4, startDate = getFutureDate(10), teams = [] } = {}) => {
        const res = await request(app).post("/api/tournaments").set("Authorization", `Bearer ${token}`).send({ name, sport, maxTeams, startDate, teams });
        if (res.status === 201 && res.body._id) tournamentIds.push(res.body._id);
        return res;
    };

    const seedTournament = async ({creatorId = ownerId, name = `Seeded Tournament ${Date.now()}`, sport = "football", maxTeams = 4, startDate = getFutureDate(10), status = "registration", teams = [] } = {}) => {
        const tournament = {
            creatorId: new ObjectId(creatorId),
            name,
            sport,
            maxTeams: Number(maxTeams),
            startDate,
            status,
            teams,
            createdAt: Date.now()
        }

        const result = await db.collection("tournaments").insertOne(tournament);
        const id = result.insertedId.toString();
        tournamentIds.push(id);
        return id;
    };

    const makeTeam = (name, players = []) => ({ _id: new ObjectId(), name, players });

    const makePlayer = (name, surname, jerseyNumber = null) => {
        const p = { name, surname };
        if (jerseyNumber !== null) p.jerseyNumber = jerseyNumber;
        return p;
    };

    beforeAll(async () => {
        await connectDB();
        db = await getDB();
        const owner = await createUser("tournament_owner", "Tournament", "Owner");
        ownerToken = owner.token;
        ownerId = owner.userId;
        const other = await createUser("tournament_other", "Other", "User");
        otherUserToken = other.token;
        otherUserId = other.userId;
    });

    beforeEach(async () => {
        const ids = tournamentIds.map((id) => new ObjectId(id));
        await db.collection("matches").deleteMany({ tournamentId: { $in: ids } });
        await db.collection("bookings").deleteMany({ tournamentId: { $in: ids } });
        await db.collection("tournaments").deleteMany({ _id: { $in: ids } });
        tournamentIds.length = 0;
    });

    afterAll(async () => {
        if (db) {
            await db.collection("matches").deleteMany({});
            await db.collection("bookings").deleteMany({});
            await db.collection("tournaments").deleteMany({ _id: { $in: tournamentIds.map((id) => new ObjectId(id)) } });
            await db.collection("users").deleteMany({ username: { $regex: /^(tournament_owner|tournament_other)_/ } });
            await closeDB();
        }
    });

    // =========================================================================
    // 1. POST /api/tournaments
    // =========================================================================
    describe("POST /api/tournaments", () => {
        it("should create a tournament with all required fields and status 'registration'", async () => {
            const res = await createTournament({ name: "Football Championship", sport: "football", maxTeams: 4, startDate: getFutureDate(20) });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("_id");
            expect(res.body.name).toBe("Football Championship");
            expect(res.body.sport).toBe("football");
            expect(res.body.maxTeams).toBe(4);
            expect(res.body.status).toBe("registration");
            expect(res.body.teams).toEqual([]);
        });

        it("should reject creation without authentication", async () => {
            const res = await request(app).post("/api/tournaments").send({ name: "Unauthorized", sport: "football", maxTeams: 4, startDate: getFutureDate(20) });
            expect(res.status).toBe(401);
        });

        it("should reject creation with missing required fields", async () => {
            const res = await request(app).post("/api/tournaments").set("Authorization", `Bearer ${ownerToken}`).send({ name: "Incomplete" });
            expect(res.status).toBe(400);
        });
    });

    // =========================================================================
    // 2. GET /api/tournaments — list & search
    // =========================================================================
    describe("GET /api/tournaments", () => {
        it("should return all tournaments when no query is provided", async () => {
            await seedTournament({ name: "Tournament Alpha" });
            await seedTournament({ name: "Tournament Beta" });
            const res = await request(app).get("/api/tournaments");
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(2);
        });

        it("should include both active and completed tournaments", async () => {
            await seedTournament({ name: "Active Cup", status: "active" });
            await seedTournament({ name: "Completed Cup", status: "completed" });
            const res = await request(app).get("/api/tournaments");
            expect(res.status).toBe(200);
            const names = res.body.map((t) => t.name);
            expect(names).toContain("Active Cup");
            expect(names).toContain("Completed Cup");
        });

        it("should support case-insensitive partial search by tournament name", async () => {
            await seedTournament({ name: "Calcio Championship" });
            await seedTournament({ name: "Basketball Cup" });
            const res = await request(app).get("/api/tournaments").query({ q: "cal" });
            expect(res.status).toBe(200);
            const names = res.body.map((t) => t.name);
            expect(names).toContain("Calcio Championship");
            expect(names).not.toContain("Basketball Cup");
        });

        it("should search nested team names", async () => {
            await seedTournament({ name: "Tournament With Team", teams: [makeTeam("California Team")] });
            const res = await request(app).get("/api/tournaments").query({ q: "cal" });
            expect(res.status).toBe(200);
            expect(res.body.some((t) => t.name === "Tournament With Team")).toBe(true);
        });

        it("should search nested player first names", async () => {
            await seedTournament({ name: "Tournament With Player", teams: [makeTeam("Team One", [makePlayer("Cal", "Johnson")])] });
            const res = await request(app).get("/api/tournaments").query({ q: "cal" });
            expect(res.status).toBe(200);
            expect(res.body.some((t) => t.name === "Tournament With Player")).toBe(true);
        });

        it("should search player surnames case-insensitively", async () => {
            await seedTournament({ name: "Surname Search Tournament", teams: [makeTeam("Team One", [makePlayer("Alice", "McDonald")])] });
            const res = await request(app).get("/api/tournaments").query({ q: "mCdOn" });
            expect(res.status).toBe(200);
            expect(res.body.some((t) => t.name === "Surname Search Tournament")).toBe(true);
        });

        it("should safely handle regex special characters in queries", async () => {
            await seedTournament({ name: "Normal Tournament" });
            const res = await request(app).get("/api/tournaments").query({ q: "[" });
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    // =========================================================================
    // 3. GET /api/tournaments/:id — details
    // =========================================================================
    describe("GET /api/tournaments/:id", () => {
        it("should return tournament details including teams and players with optional jersey number", async () => {
            const team = makeTeam("Team One", [makePlayer("John", "Smith", 10)]);
            const tournamentId = await seedTournament({ name: "Detailed Tournament", teams: [team, makeTeam("Team Two", [makePlayer("Alice", "Brown")])] });
            const res = await request(app).get(`/api/tournaments/${tournamentId}`);
            expect(res.status).toBe(200);
            expect(res.body.name).toBe("Detailed Tournament");
            expect(res.body.teams).toHaveLength(2);
            expect(res.body.teams[0].players[0].name).toBe("John");
            expect(res.body.teams[0].players[0].jerseyNumber).toBe(10);
        });

        it("should return 404 for a non-existent tournament", async () => {
            const res = await request(app).get(`/api/tournaments/${new ObjectId()}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("error");
        });
    });

    // =========================================================================
    // 4. PUT /api/tournaments/:id — editing
    // =========================================================================
    describe("PUT /api/tournaments/:id", () => {
        it("should allow the creator to edit name and maxTeams during registration", async () => {
            const tournamentId = await seedTournament({ name: "Original Name", maxTeams: 4 });
            const res = await request(app).put(`/api/tournaments/${tournamentId}`).set("Authorization", `Bearer ${ownerToken}`).send({ name: "Updated Name", maxTeams: 6 });
            expect(res.status).toBe(200);
            const updated = await db.collection("tournaments").findOne({ _id: new ObjectId(tournamentId) });
            expect(updated.name).toBe("Updated Name");
            expect(updated.maxTeams).toBe(6);
        });

        it("should reject edits from a non-creator", async () => {
            const tournamentId = await seedTournament();
            const res = await request(app).put(`/api/tournaments/${tournamentId}`).set("Authorization", `Bearer ${otherUserToken}`).send({ name: "Unauthorized Update" });
            expect(res.status).toBe(403);
        });

        it("should reject edits once the tournament is active", async () => {
            const tournamentId = await seedTournament({ status: "active" });
            const res = await request(app).put(`/api/tournaments/${tournamentId}`).set("Authorization", `Bearer ${ownerToken}`).send({ name: "Should Not Change" });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/currently in.*active/i);
        });

        it("should reject edits when the tournament is completed", async () => {
            const tournamentId = await seedTournament({ status: "completed" });
            const res = await request(app).put(`/api/tournaments/${tournamentId}`).set("Authorization", `Bearer ${ownerToken}`).send({ name: "Should Not Change" });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/currently in.*completed/i);
        });

        it("should reject unauthenticated edits", async () => {
            const tournamentId = await seedTournament();
            const res = await request(app).put(`/api/tournaments/${tournamentId}`).send({ name: "Unauthorized" });
            expect(res.status).toBe(401);
        });
    });

    // =========================================================================
    // 5. Team & player management
    // =========================================================================
    describe("Team and player management", () => {
        it("should allow the creator to add a team with players (including optional jersey) during registration", async () => {
            const tournamentId = await seedTournament({ maxTeams: 2 });
            const team = makeTeam("California Team", [makePlayer("John", "Smith", 10), makePlayer("Alice", "Brown")]);
            const res = await request(app).put(`/api/tournaments/${tournamentId}`).set("Authorization", `Bearer ${ownerToken}`).send({ teams: [team] });
            expect(res.status).toBe(200);
            const saved = await db.collection("tournaments").findOne({ _id: new ObjectId(tournamentId) });
            expect(saved.teams).toHaveLength(1);
            expect(saved.teams[0].name).toBe("California Team");
            expect(saved.teams[0].players[0].jerseyNumber).toBe(10);
            expect(saved.teams[0].players[1].name).toBe("Alice");
        });

        it("should reject team updates after schedule generation (active status)", async () => {
            const teams = [makeTeam("Team A"), makeTeam("Team B")];
            const tournamentId = await seedTournament({ maxTeams: 2, teams, status: "active" });
            const res = await request(app).put(`/api/tournaments/${tournamentId}`).set("Authorization", `Bearer ${ownerToken}`).send({ teams: [...teams, makeTeam("Team C")] });
            expect(res.status).toBe(400);
        });
    });

    // =========================================================================
    // 6. DELETE /api/tournaments/:id — deletion
    // =========================================================================
    describe("DELETE /api/tournaments/:id", () => {
        it("should allow the creator to delete a tournament", async () => {
            const tournamentId = await seedTournament();
            const res = await request(app).delete(`/api/tournaments/${tournamentId}`).set("Authorization", `Bearer ${ownerToken}`);
            expect(res.status).toBe(200);
            expect(res.body.message).toMatch(/deleted successfully/i);
            expect(await db.collection("tournaments").findOne({ _id: new ObjectId(tournamentId) })).toBeNull();
        });

        it("should prevent a non-creator from deleting a tournament", async () => {
            const tournamentId = await seedTournament();
            const res = await request(app).delete(`/api/tournaments/${tournamentId}`).set("Authorization", `Bearer ${otherUserToken}`);
            expect(res.status).toBe(403);
            expect(await db.collection("tournaments").findOne({ _id: new ObjectId(tournamentId) })).not.toBeNull();
        });

        it("should cascade-delete matches belonging to the tournament", async () => {
            const tournamentId = await seedTournament({ status: "active" });
            await db.collection("matches").insertMany([
                { tournamentId: new ObjectId(tournamentId), teamA: new ObjectId(), teamB: new ObjectId(), round: 1, status: "upcoming" },
                { tournamentId: new ObjectId(tournamentId), teamA: new ObjectId(), teamB: new ObjectId(), round: 2, status: "upcoming" },
            ]);
            await request(app).delete(`/api/tournaments/${tournamentId}`).set("Authorization", `Bearer ${ownerToken}`).expect(200);
            expect(await db.collection("matches").find({ tournamentId: new ObjectId(tournamentId) }).toArray()).toHaveLength(0);
        });

        it("should cascade-delete bookings tied to tournament matches", async () => {
            const tournamentId = await seedTournament({ status: "active" });
            const matchResult = await db.collection("matches").insertOne({ tournamentId: new ObjectId(tournamentId), teamA: new ObjectId(), teamB: new ObjectId(), round: 1, status: "upcoming" });
            await db.collection("bookings").insertOne({ fieldId: new ObjectId(), matchId: matchResult.insertedId, tournamentId: new ObjectId(tournamentId), date: getFutureDate(5), slot: "10:00-11:00", type: "tournament" });
            await request(app).delete(`/api/tournaments/${tournamentId}`).set("Authorization", `Bearer ${ownerToken}`).expect(200);
            expect(await db.collection("bookings").find({ matchId: matchResult.insertedId }).toArray()).toHaveLength(0);
        });
    });

    // =========================================================================
    // 7. POST /api/tournaments/:id/matches/generate
    // =========================================================================
    describe("POST /api/tournaments/:id/matches/generate", () => {
        it("should reject schedule generation when the tournament is not full", async () => {
            const tournamentId = await seedTournament({ maxTeams: 4, teams: [makeTeam("Team A"), makeTeam("Team B")] });
            const res = await request(app).post(`/api/tournaments/${tournamentId}/matches/generate`).set("Authorization", `Bearer ${ownerToken}`);
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/until all teams are registered/i);
        });

        it("should generate correct match count for even number of teams (4 teams → 6 matches, 3 rounds)", async () => {
            const teams = [makeTeam("Team A"), makeTeam("Team B"), makeTeam("Team C"), makeTeam("Team D")];
            const tournamentId = await seedTournament({ maxTeams: 4, teams });
            const res = await request(app).post(`/api/tournaments/${tournamentId}/matches/generate`).set("Authorization", `Bearer ${ownerToken}`);
            expect(res.status).toBe(201);
            expect(res.body.message).toMatch(/schedule generated/i);
            const matches = await db.collection("matches").find({ tournamentId: new ObjectId(tournamentId) }).toArray();
            expect(matches).toHaveLength(6);
            expect(new Set(matches.map((m) => m.round)).size).toBe(3);
        });

        it("should ensure every pair of teams plays exactly once", async () => {
            const teams = [makeTeam("Team A"), makeTeam("Team B"), makeTeam("Team C"), makeTeam("Team D")];
            const tournamentId = await seedTournament({ maxTeams: 4, teams });
            await request(app).post(`/api/tournaments/${tournamentId}/matches/generate`).set("Authorization", `Bearer ${ownerToken}`).expect(201);
            const matches = await db.collection("matches").find({ tournamentId: new ObjectId(tournamentId) }).toArray();
            const pairs = matches.map((m) => [m.teamA.toString(), m.teamB.toString()].sort().join("-"));
            expect(new Set(pairs).size).toBe(6);
        });

        it("should store correct match fields on generation", async () => {
            const teams = [makeTeam("Team A"), makeTeam("Team B")];
            const tournamentId = await seedTournament({ maxTeams: 2, teams });
            await request(app).post(`/api/tournaments/${tournamentId}/matches/generate`).set("Authorization", `Bearer ${ownerToken}`).expect(201);
            const matches = await db.collection("matches").find({ tournamentId: new ObjectId(tournamentId) }).toArray();
            for (const match of matches) {
                expect(match).toHaveProperty("teamAName");
                expect(match).toHaveProperty("teamBName");
                expect(match.status).toBe("upcoming");
                expect(match.fieldId).toBeNull();
                expect(match.date).toBeNull();
                expect(match.slot).toBeNull();
                expect(match.bookingId).toBeNull();
            }
        });

        it("should generate BYE matches for odd number of teams with null team ID", async () => {
            const teams = [makeTeam("Team A"), makeTeam("Team B"), makeTeam("Team C")];
            const tournamentId = await seedTournament({ maxTeams: 3, teams });
            const res = await request(app).post(`/api/tournaments/${tournamentId}/matches/generate`).set("Authorization", `Bearer ${ownerToken}`);
            expect(res.status).toBe(201);
            const matches = await db.collection("matches").find({ tournamentId: new ObjectId(tournamentId) }).toArray();
            expect(matches).toHaveLength(6);
            const byeMatches = matches.filter((m) => m.teamA === null || m.teamB === null);
            expect(byeMatches).toHaveLength(3);
            for (const m of byeMatches) {
                expect(m.teamAName === "BYE" || m.teamBName === "BYE").toBe(true);
            }
        });

        it("should advance tournament status to 'active' after generation", async () => {
            const teams = [makeTeam("Team A"), makeTeam("Team B")];
            const tournamentId = await seedTournament({ maxTeams: 2, teams, status: "registration" });
            await request(app).post(`/api/tournaments/${tournamentId}/matches/generate`).set("Authorization", `Bearer ${ownerToken}`).expect(201);
            const tournament = await db.collection("tournaments").findOne({ _id: new ObjectId(tournamentId) });
            expect(tournament.status).toBe("active");
        });

        it("should allow only the tournament creator to generate the schedule", async () => {
            const teams = [makeTeam("Team A"), makeTeam("Team B")];
            const tournamentId = await seedTournament({ maxTeams: 2, teams });
            const res = await request(app).post(`/api/tournaments/${tournamentId}/matches/generate`).set("Authorization", `Bearer ${otherUserToken}`);
            expect(res.status).toBe(403);
        });
    });

    // =========================================================================
    // 8. GET /api/tournaments/:id/matches
    // =========================================================================
    describe("GET /api/tournaments/:id/matches", () => {
        it("should return all matches for a tournament", async () => {
            const tournamentId = await seedTournament({ status: "active" });
            await db.collection("matches").insertMany([
                { tournamentId: new ObjectId(tournamentId), teamA: new ObjectId(), teamB: new ObjectId(), teamAName: "Team A", teamBName: "Team B", round: 1, status: "upcoming", fieldId: null, date: null, slot: null, bookingId: null },
                { tournamentId: new ObjectId(tournamentId), teamA: new ObjectId(), teamB: new ObjectId(), teamAName: "Team C", teamBName: "Team D", round: 1, status: "upcoming", fieldId: null, date: null, slot: null, bookingId: null },
            ]);
            const res = await request(app).get(`/api/tournaments/${tournamentId}/matches`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(2);
        });
    });

    // =========================================================================
    // 9. GET /api/matches/:id
    // =========================================================================
    describe("GET /api/matches/:id", () => {
        it("should return full match details including status, teams, date, field and result", async () => {
            const tournamentId = await seedTournament({ status: "active" });
            const matchResult = await db.collection("matches").insertOne({ tournamentId: new ObjectId(tournamentId), teamA: new ObjectId(), teamB: new ObjectId(), teamAName: "Team A", teamBName: "Team B", round: 1, status: "upcoming", fieldId: null, date: null, slot: null, bookingId: null });
            const matchId = matchResult.insertedId.toString();
            const res = await request(app).get(`/api/matches/${matchId}`);
            expect(res.status).toBe(200);
            expect(res.body._id).toBe(matchId);
            expect(res.body.teamAName).toBe("Team A");
            expect(res.body.status).toBe("upcoming");
        });

        it("should return 404 for a non-existent match", async () => {
            const res = await request(app).get(`/api/matches/${new ObjectId()}`);
            expect(res.status).toBe(404);
        });
    });

    // =========================================================================
    // 10. PUT /api/matches/:id/result
    // =========================================================================
    describe("PUT /api/matches/:id/result", () => {
        const createScheduledMatch = async ({ sport = "football", date = getPastDate(1) } = {}) => {
            const teamA = makeTeam(`${sport} Team A`);
            const teamB = makeTeam(`${sport} Team B`);
            const tournamentId = await seedTournament({ sport, maxTeams: 2, teams: [teamA, teamB], status: "active" });
            const matchResult = await db.collection("matches").insertOne({ tournamentId: new ObjectId(tournamentId), teamA: teamA._id, teamB: teamB._id, teamAName: teamA.name, teamBName: teamB.name, round: 1, status: "upcoming", fieldId: null, date, slot: "10:00-11:00", bookingId: null });
            return { tournamentId, matchId: matchResult.insertedId.toString() };
        };

        it("should allow the creator to enter a result after match date, stored as nested result: { scoreA, scoreB }", async () => {
            const { matchId } = await createScheduledMatch({ sport: "football", date: getPastDate(1) });
            const res = await request(app).put(`/api/matches/${matchId}/result`).set("Authorization", `Bearer ${ownerToken}`).send({ scoreA: 3, scoreB: 1 });
            expect(res.status).toBe(200);
            const match = await db.collection("matches").findOne({ _id: new ObjectId(matchId) });
            expect(match.status).toBe("played");
            expect(match.result.scoreA).toBe(3);
            expect(match.result.scoreB).toBe(1);
        });

        it("should reject result entry for an unscheduled match (date is null)", async () => {
            const { tournamentId } = await createScheduledMatch();
            const unscheduled = await db.collection("matches").insertOne({ tournamentId: new ObjectId(tournamentId), teamA: new ObjectId(), teamB: new ObjectId(), teamAName: "A", teamBName: "B", round: 2, status: "upcoming", fieldId: null, date: null, slot: null, bookingId: null });
            const res = await request(app).put(`/api/matches/${unscheduled.insertedId}/result`).set("Authorization", `Bearer ${ownerToken}`).send({ scoreA: 2, scoreB: 1 });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/scheduled/i);
        });

        it("should reject result entry before the match date", async () => {
            const { matchId } = await createScheduledMatch({ date: getFutureDate(2) });
            const res = await request(app).put(`/api/matches/${matchId}/result`).set("Authorization", `Bearer ${ownerToken}`).send({ scoreA: 2, scoreB: 1 });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/date|past|future/i);
        });

        it("should reject a draw in volleyball", async () => {
            const { matchId } = await createScheduledMatch({ sport: "volleyball", date: getPastDate(1) });
            const res = await request(app).put(`/api/matches/${matchId}/result`).set("Authorization", `Bearer ${ownerToken}`).send({ scoreA: 2, scoreB: 2 });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/draws are not permitted/i);
        });

        it("should reject a draw in basketball", async () => {
            const { matchId } = await createScheduledMatch({ sport: "basketball", date: getPastDate(1) });
            const res = await request(app).put(`/api/matches/${matchId}/result`).set("Authorization", `Bearer ${ownerToken}`).send({ scoreA: 80, scoreB: 80 });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/draws are not permitted/i);
        });

        it("should allow a non-draw volleyball result", async () => {
            const { matchId } = await createScheduledMatch({ sport: "volleyball", date: getPastDate(1) });
            const res = await request(app).put(`/api/matches/${matchId}/result`).set("Authorization", `Bearer ${ownerToken}`).send({ scoreA: 3, scoreB: 1 });
            expect(res.status).toBe(200);
        });

        it("should allow a non-draw basketball result", async () => {
            const { matchId } = await createScheduledMatch({ sport: "basketball", date: getPastDate(1) });
            const res = await request(app).put(`/api/matches/${matchId}/result`).set("Authorization", `Bearer ${ownerToken}`).send({ scoreA: 90, scoreB: 85 });
            expect(res.status).toBe(200);
        });

        it("should reject result entry from a non-creator", async () => {
            const { matchId } = await createScheduledMatch({ date: getPastDate(1) });
            const res = await request(app).put(`/api/matches/${matchId}/result`).set("Authorization", `Bearer ${otherUserToken}`).send({ scoreA: 2, scoreB: 1 });
            expect(res.status).toBe(403);
        });

        it("should require authentication", async () => {
            const { matchId } = await createScheduledMatch({ date: getPastDate(1) });
            const res = await request(app).put(`/api/matches/${matchId}/result`).send({ scoreA: 2, scoreB: 1 });
            expect(res.status).toBe(401);
        });
    });

    // =========================================================================
    // 11. GET /api/tournaments/:id/standings
    // =========================================================================
    describe("GET /api/tournaments/:id/standings", () => {
        // All played matches seeded directly to DB use nested result: { scoreA, scoreB }
        const insertPlayedMatch = (tournamentId, teamA, teamB, scoreA, scoreB, round = 1) =>
            db.collection("matches").insertOne({
                tournamentId: new ObjectId(tournamentId),
                teamA: teamA._id, teamB: teamB._id,
                teamAName: teamA.name, teamBName: teamB.name,
                status: "played",
                result: { scoreA, scoreB },
                round,
            });

        it("should calculate football standings using 3-1-0 point system", async () => {
            const teamA = makeTeam("Football A");
            const teamB = makeTeam("Football B");
            const teamC = makeTeam("Football C");
            const tournamentId = await seedTournament({ sport: "football", maxTeams: 3, teams: [teamA, teamB, teamC], status: "active" });
            await insertPlayedMatch(tournamentId, teamA, teamB, 3, 1); // A wins → 3 pts
            await insertPlayedMatch(tournamentId, teamB, teamC, 2, 2); // Draw → 1 pt each
            const res = await request(app).get(`/api/tournaments/${tournamentId}/standings`);
            expect(res.status).toBe(200);
            const a = res.body.find((t) => t.teamId === teamA._id.toString());
            const b = res.body.find((t) => t.teamId === teamB._id.toString());
            const c = res.body.find((t) => t.teamId === teamC._id.toString());
            expect(a.points).toBe(3);
            expect(b.points).toBe(1);
            expect(c.points).toBe(1);
            expect(a.played).toBe(1);
            expect(b.played).toBe(2);
        });

        it("should calculate scored, conceded and goal difference", async () => {
            const teamA = makeTeam("Stats A");
            const teamB = makeTeam("Stats B");
            const tournamentId = await seedTournament({ sport: "football", maxTeams: 2, teams: [teamA, teamB], status: "active" });
            await insertPlayedMatch(tournamentId, teamA, teamB, 5, 2);
            const res = await request(app).get(`/api/tournaments/${tournamentId}/standings`);
            expect(res.status).toBe(200);
            const a = res.body.find((t) => t.teamId === teamA._id.toString());
            const b = res.body.find((t) => t.teamId === teamB._id.toString());
            expect(a.scored).toBe(5); expect(a.conceded).toBe(2); expect(a.diff).toBe(3);
            expect(b.scored).toBe(2); expect(b.conceded).toBe(5); expect(b.diff).toBe(-3);
        });

        it("should award 2 points for a volleyball win and 0 for a loss", async () => {
            const teamA = makeTeam("Volleyball A");
            const teamB = makeTeam("Volleyball B");
            const tournamentId = await seedTournament({ sport: "volleyball", maxTeams: 2, teams: [teamA, teamB], status: "active" });
            await insertPlayedMatch(tournamentId, teamA, teamB, 3, 1);
            const res = await request(app).get(`/api/tournaments/${tournamentId}/standings`);
            expect(res.status).toBe(200);
            expect(res.body.find((t) => t.teamId === teamA._id.toString()).points).toBe(2);
            expect(res.body.find((t) => t.teamId === teamB._id.toString()).points).toBe(0);
        });

        it("should award 2 points for a basketball win", async () => {
            const teamA = makeTeam("Basketball A");
            const teamB = makeTeam("Basketball B");
            const tournamentId = await seedTournament({ sport: "basketball", maxTeams: 2, teams: [teamA, teamB], status: "active" });
            await insertPlayedMatch(tournamentId, teamA, teamB, 90, 80);
            const res = await request(app).get(`/api/tournaments/${tournamentId}/standings`);
            expect(res.status).toBe(200);
            expect(res.body.find((t) => t.teamId === teamA._id.toString()).points).toBe(2);
        });

        it("should include teams with no played matches (all stats zeroed)", async () => {
            const teamA = makeTeam("Played Team");
            const teamB = makeTeam("Unplayed Team");
            const tournamentId = await seedTournament({ sport: "football", maxTeams: 2, teams: [teamA, teamB], status: "active" });
            const res = await request(app).get(`/api/tournaments/${tournamentId}/standings`);
            expect(res.status).toBe(200);
            const unplayed = res.body.find((t) => t.teamId === teamB._id.toString());
            expect(unplayed).toBeDefined();
            expect(unplayed.points).toBe(0);
            expect(unplayed.played).toBe(0);
            expect(unplayed.won).toBe(0);
            expect(unplayed.drawn).toBe(0);
            expect(unplayed.lost).toBe(0);
            expect(unplayed.scored).toBe(0);
            expect(unplayed.conceded).toBe(0);
            expect(unplayed.diff).toBe(0);
        });

        it("should ignore upcoming matches when calculating standings", async () => {
            const teamA = makeTeam("Upcoming A");
            const teamB = makeTeam("Upcoming B");
            const tournamentId = await seedTournament({ sport: "football", maxTeams: 2, teams: [teamA, teamB], status: "active" });
            await db.collection("matches").insertOne({ tournamentId: new ObjectId(tournamentId), teamA: teamA._id, teamB: teamB._id, teamAName: teamA.name, teamBName: teamB.name, status: "upcoming", result: { scoreA: 10, scoreB: 0 }, round: 1 });
            const res = await request(app).get(`/api/tournaments/${tournamentId}/standings`);
            expect(res.status).toBe(200);
            for (const team of res.body) { expect(team.played).toBe(0); expect(team.points).toBe(0); }
        });

        it("should sort standings by points then diff then scored (descending)", async () => {
            const teamA = makeTeam("Sort A");
            const teamB = makeTeam("Sort B");
            const teamC = makeTeam("Sort C");
            const tournamentId = await seedTournament({ sport: "football", maxTeams: 3, teams: [teamA, teamB, teamC], status: "active" });
            await insertPlayedMatch(tournamentId, teamA, teamB, 3, 0, 1); // A: 3pts, diff +3
            await insertPlayedMatch(tournamentId, teamC, teamB, 2, 1, 2); // C: 3pts, diff +1
            const res = await request(app).get(`/api/tournaments/${tournamentId}/standings`);
            expect(res.status).toBe(200);
            expect(res.body[0].teamId).toBe(teamA._id.toString());
            expect(res.body[1].teamId).toBe(teamC._id.toString());
        });
    });
});
