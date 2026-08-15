import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import app from "../app.js";
import { closeDB, connectDB, getDB } from "../db.js";

describe("Users API Integration Tests", () => {
    let db;

    let user1Token = "";
    let user1Id = "";
    let user1Username = "";

    let user2Token = "";
    let user2Id = "";
    let user2Username = "";

    const userIds = [];
    const tournamentIds = [];

    // =========================================================================
    // Helpers
    // =========================================================================

    const createUser = async (prefix, name, surname) => {
        const username = `${prefix}_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}`;

        const password = "Password123!";

        await request(app)
            .post("/api/1.0/auth/signup")
            .send({
                username,
                password,
                name,
                surname,
            })
            .expect(201);

        const auth = await request(app)
            .post("/api/1.0/auth/signin")
            .send({
                username,
                password,
            })
            .expect(200);

        const userId = jwt.decode(auth.body.token).userId;

        userIds.push(userId);

        return {
            token: auth.body.token,
            userId,
            username,
        };
    };

    const seedUser = async ({
                                username = `seed_${Date.now()}_${Math.random()
                                    .toString(36)
                                    .slice(2, 8)}`,
                                password = "Password123!",
                                name = "Test",
                                surname = "User",
                            } = {}) => {
        const user = {
            username,
            password,
            name,
            surname,
        };

        const result = await db.collection("users").insertOne(user);

        userIds.push(result.insertedId.toString());

        return result.insertedId.toString();
    };

    const seedTournament = async ({
                                      creatorId,
                                      name = `Tournament ${Date.now()}`,
                                      sport = "football",
                                      maxTeams = 4,
                                      startDate = "2099-01-01",
                                      status = "registration",
                                  } = {}) => {
        const tournament = {
            creatorId: new ObjectId(creatorId),
            name,
            sport,
            maxTeams,
            startDate,
            status,
            teams: [],
            createdAt: Date.now(),
        };

        const result = await db
            .collection("tournaments")
            .insertOne(tournament);

        tournamentIds.push(result.insertedId.toString());

        return result.insertedId.toString();
    };

    // =========================================================================
    // Setup
    // =========================================================================

    beforeAll(async () => {
        await connectDB();
        db = await getDB();

        const user1 = await createUser(
            "users_test_alice",
            "Alice",
            "Johnson"
        );

        user1Token = user1.token;
        user1Id = user1.userId;
        user1Username = user1.username;

        const user2 = await createUser(
            "users_test_bob",
            "Bob",
            "Smith"
        );

        user2Token = user2.token;
        user2Id = user2.userId;
        user2Username = user2.username;
    });

    beforeEach(async () => {
        if (tournamentIds.length > 0) {
            await db.collection("tournaments").deleteMany({
                _id: {
                    $in: tournamentIds.map((id) => new ObjectId(id)),
                },
            });
        }

        tournamentIds.length = 0;
    });

    afterAll(async () => {
        if (db) {
            await db.collection("tournaments").deleteMany({
                _id: {
                    $in: tournamentIds.map((id) => new ObjectId(id)),
                },
            });

            await db.collection("users").deleteMany({
                _id: {
                    $in: userIds.map((id) => new ObjectId(id)),
                },
            });

            // Cleanup in case a user was created before its ID was recorded.
            await db.collection("users").deleteMany({
                username: {
                    $regex: /^users_test_(alice|bob)_/,
                },
            });

            await closeDB();
        }
    });

    // =========================================================================
    // 1. GET /api/1.0/users
    // =========================================================================

    describe("GET /api/1.0/users", () => {
        it("should return a list of users", async () => {
            const res = await request(app)
                .get("/api/1.0/users")
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(2);
        });

        it("should return only public user information", async () => {
            const res = await request(app)
                .get("/api/1.0/users")
                .expect(200);

            const user = res.body.find(
                (u) => u.username === user1Username
            );

            expect(user).toBeDefined();
            expect(user).toHaveProperty("_id");
            expect(user).toHaveProperty("username");
            expect(user).toHaveProperty("name");
            expect(user).toHaveProperty("surname");
            expect(user).not.toHaveProperty("password");
        });

        it("should search users by username using a case-insensitive partial query", async () => {
            const uniquePart = "alice";

            const res = await request(app)
                .get("/api/1.0/users")
                .query({ q: uniquePart.toUpperCase() })
                .expect(200);

            const usernames = res.body.map((u) => u.username);

            expect(usernames).toContain(user1Username);
            expect(usernames).not.toContain(user2Username);
        });

        it("should search users by first name", async () => {
            const res = await request(app)
                .get("/api/1.0/users")
                .query({ q: "ali" })
                .expect(200);

            expect(
                res.body.some((u) => u.username === user1Username)
            ).toBe(true);

            expect(
                res.body.some((u) => u.username === user2Username)
            ).toBe(false);
        });

        it("should search users by surname", async () => {
            const res = await request(app)
                .get("/api/1.0/users")
                .query({ q: "john" })
                .expect(200);

            expect(
                res.body.some((u) => u.username === user1Username)
            ).toBe(true);

            expect(
                res.body.some((u) => u.username === user2Username)
            ).toBe(false);
        });

        it("should return no users when the search has no matches", async () => {
            const res = await request(app)
                .get("/api/1.0/users")
                .query({ q: "this_user_does_not_exist_xyz" })
                .expect(200);

            expect(res.body).toEqual([]);
        });

        it("should safely handle regex special characters in the search query", async () => {
            const res = await request(app)
                .get("/api/1.0/users")
                .query({ q: "[" })
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
        });

        it("should not return users outside the search criteria", async () => {
            const res = await request(app)
                .get("/api/1.0/users")
                .query({ q: "Alice" })
                .expect(200);

            const usernames = res.body.map((u) => u.username);

            expect(usernames).toContain(user1Username);
            expect(usernames).not.toContain(user2Username);
        });
    });

    // =========================================================================
    // 2. GET /api/1.0/users/:id
    // =========================================================================

    describe("GET /api/1.0/users/:id", () => {
        it("should return a user by ID", async () => {
            const res = await request(app)
                .get(`/api/1.0/users/${user1Id}`)
                .expect(200);

            expect(res.body).toHaveProperty("user");
            expect(res.body.user).toHaveProperty("_id");
            expect(res.body.user._id).toBe(user1Id);
            expect(res.body.user.username).toBe(user1Username);
            expect(res.body.user.name).toBe("Alice");
            expect(res.body.user.surname).toBe("Johnson");
        });

        it("should return only public user information", async () => {
            const res = await request(app)
                .get(`/api/1.0/users/${user1Id}`)
                .expect(200);

            expect(res.body).toHaveProperty("user");

            expect(res.body.user).toHaveProperty("_id");
            expect(res.body.user).toHaveProperty("username");
            expect(res.body.user).toHaveProperty("name");
            expect(res.body.user).toHaveProperty("surname");

            expect(res.body.user).not.toHaveProperty("password");
        });

        it("should return 404 for a non-existent user", async () => {
            const nonExistentId = new ObjectId().toString();

            const res = await request(app)
                .get(`/api/1.0/users/${nonExistentId}`)
                .expect(404);

            expect(res.body).toHaveProperty("error");
        });

        it("should return 400 for an invalid user ID", async () => {
            const res = await request(app)
                .get("/api/1.0/users/not-a-valid-object-id")
                .expect(400);

            expect(res.body).toHaveProperty("error");
        });
    });

    // =========================================================================
    // 3. User tournaments
    // =========================================================================

    describe("User tournaments", () => {
        it("should return the user's tournaments", async () => {
            await seedTournament({
                creatorId: user1Id,
                name: "Alice Tournament",
            });

            const res = await request(app)
                .get(`/api/1.0/users/${user1Id}`)
                .expect(200);

            expect(res.body).toHaveProperty("user");
            expect(res.body).toHaveProperty("tournaments");

            expect(res.body.user._id).toBe(user1Id);
            expect(res.body.user.username).toBe(user1Username);

            expect(res.body.tournaments).toHaveLength(1);
            expect(res.body.tournaments[0].name).toBe("Alice Tournament");
        });

        it("should return all tournaments created by the user", async () => {
            await seedTournament({
                creatorId: user1Id,
                name: "Alice Football Cup",
            });

            await seedTournament({
                creatorId: user1Id,
                name: "Alice Basketball Cup",
                sport: "basketball",
            });

            const res = await request(app)
                .get(`/api/1.0/users/${user1Id}`)
                .expect(200);

            expect(res.body.tournaments).toHaveLength(2);

            const tournamentNames = res.body.tournaments.map(
                (t) => t.name
            );

            expect(tournamentNames).toContain("Alice Football Cup");
            expect(tournamentNames).toContain("Alice Basketball Cup");
        });

        it("should not include tournaments created by another user", async () => {
            await seedTournament({
                creatorId: user1Id,
                name: "Alice Tournament",
            });

            await seedTournament({
                creatorId: user2Id,
                name: "Bob Tournament",
            });

            const res = await request(app)
                .get(`/api/1.0/users/${user1Id}`)
                .expect(200);

            const tournamentNames = res.body.tournaments.map(
                (t) => t.name
            );

            expect(tournamentNames).toContain("Alice Tournament");
            expect(tournamentNames).not.toContain("Bob Tournament");
        });

        it("should return an empty tournament list when the user created no tournaments", async () => {
            const newUserId = await seedUser({
                username: `no_tournaments_${Date.now()}`,
                name: "No",
                surname: "Tournaments",
            });

            const res = await request(app)
                .get(`/api/1.0/users/${newUserId}`)
                .expect(200);

            expect(res.body).toHaveProperty("tournaments");
            expect(res.body.tournaments).toEqual([]);
        });

        it("should include tournaments regardless of their status", async () => {
            await seedTournament({
                creatorId: user1Id,
                name: "Registration Tournament",
                status: "registration",
            });

            await seedTournament({
                creatorId: user1Id,
                name: "Active Tournament",
                status: "active",
            });

            await seedTournament({
                creatorId: user1Id,
                name: "Completed Tournament",
                status: "completed",
            });

            const res = await request(app)
                .get(`/api/1.0/users/${user1Id}`)
                .expect(200);

            expect(res.body.tournaments).toHaveLength(3);

            const statuses = res.body.tournaments.map(
                (t) => t.status
            );

            expect(statuses).toContain("registration");
            expect(statuses).toContain("active");
            expect(statuses).toContain("completed");
        });
    });
});