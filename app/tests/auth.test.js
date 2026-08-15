import {afterAll, beforeAll, describe, expect, it} from "vitest";
import request from "supertest";
import app from "../app.js";
import {connectDB, getDB} from "../db.js";

describe("Auth API Integration Tests", () => {
    let token = "";
    const testUser = {
        username: "testuser_" + Date.now(),
        password: "Password123!",
        name: "Test",
        surname: "User"
    };

    beforeAll(async () => {
        // Connects to the in-memory DB started in vitest.setup.js
        await connectDB();
    });

    afterAll(async () => {
        // Close DB connection cleanly so Vitest can exit
        const db = await getDB();
        if (db?.client) {
            await db.client.close();
        }
    });

    describe("POST /api/auth/signup", () => {
        it("should register a user successfully", async () => {
            const res = await request(app)
                .post("/api/auth/signup")
                .send(testUser);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("message");
        });
    });

    describe("POST /api/auth/signin", () => {
        it("should authenticate and return a token", async () => {
            const res = await request(app)
                .post("/api/auth/signin")
                .send({
                    username: testUser.username,
                    password: testUser.password
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("token");
            token = res.body.token;
        });
    });

    describe("GET /api/auth/whoami", () => {
        it("should return profile for authenticated user", async () => {
            const res = await request(app)
                .get("/api/auth/whoami")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.username).toBe(testUser.username);
        });
    });
});