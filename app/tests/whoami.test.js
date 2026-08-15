import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";
import { closeDB, connectDB, getDB } from "../db.js";

describe("WhoAmI API Integration Tests", () => {
    let db;

    let userToken = "";
    let userId = "";
    let username = "";

    const createdUsernames = [];

    // =========================================================================
    // Helpers
    // =========================================================================

    const createUser = async () => {
        username = `whoami_test_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}`;

        const password = "Password123!";

        await request(app)
            .post("/api/1.0/auth/signup")
            .send({
                username,
                password,
                name: "Alice",
                surname: "Johnson",
            })
            .expect(201);

        const auth = await request(app)
            .post("/api/1.0/auth/signin")
            .send({
                username,
                password,
            })
            .expect(200);

        userToken = auth.body.token;
        userId = jwt.decode(userToken).userId;

        createdUsernames.push(username);
    };

    // =========================================================================
    // Setup
    // =========================================================================

    beforeAll(async () => {
        await connectDB();
        db = await getDB();

        await createUser();
    });

    afterAll(async () => {
        if (db) {
            await db.collection("users").deleteMany({
                username: {
                    $in: createdUsernames,
                },
            });

            await closeDB();
        }
    });

    // =========================================================================
    // GET /api/whoami
    // =========================================================================

    describe("GET /api/1.0/whoami", () => {
        it("should return the authenticated user's information", async () => {
            const res = await request(app)
                .get("/api/1.0/whoami")
                .set("Authorization", `Bearer ${userToken}`)
                .expect(200);

            expect(res.body.user).toHaveProperty("_id");
            expect(res.body.user._id).toBe(userId);
            expect(res.body.user.username).toBe(username);
            expect(res.body.user.name).toBe("Alice");
            expect(res.body.user.surname).toBe("Johnson");
        });

        it("should not expose the user's password", async () => {
            const res = await request(app)
                .get("/api/1.0/whoami")
                .set("Authorization", `Bearer ${userToken}`)
                .expect(200);

            expect(res.body.user).not.toHaveProperty("password");
        });

        it("should reject requests without authentication", async () => {
            const res = await request(app)
                .get("/api/1.0/whoami")
                .expect(401);

            expect(res.body).toHaveProperty("error");
        });

        it("should reject an invalid JWT token", async () => {
            const res = await request(app)
                .get("/api/1.0/whoami")
                .set("Authorization", "Bearer invalid-token")
                .expect(401);

            expect(res.body).toHaveProperty("error");
        });

        it("should reject a request with an invalid Authorization header", async () => {
            const res = await request(app)
                .get("/api/1.0/whoami")
                .set("Authorization", "invalid-header")
                .expect(401);

            expect(res.body).toHaveProperty("error");
        });

        it("should return the correct user identified by the JWT", async () => {
            const res = await request(app)
                .get("/api/1.0/whoami")
                .set("Authorization", `Bearer ${userToken}`)
                .expect(200);

            const userFromDB = await db.collection("users").findOne({
                username,
            });

            expect(userFromDB).not.toBeNull();
            expect(res.body.user._id).toBe(userFromDB._id.toString());
            expect(res.body.user.username).toBe(userFromDB.username);
            expect(res.body.user.name).toBe(userFromDB.name);
            expect(res.body.user.surname).toBe(userFromDB.surname);
        });
    });
});