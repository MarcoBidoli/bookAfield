import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { ObjectId } from "mongodb";
import app from "../app.js";
import { connectDB, getDB } from "../db.js";

describe("Fields & Bookings API Integration Tests", () => {
    let db;
    let userToken = "";
    let userId = "";
    let otherUserToken = "";
    let fieldId = "";

    // Helper to generate ISO date string for future dates (YYYY-MM-DD)
    const getFutureDate = (daysAhead = 1) => {
        const date = new Date();
        date.setDate(date.getDate() + daysAhead);
        return date.toISOString().split("T")[0];
    };

    const getPastDate = (daysAgo = 1) => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString().split("T")[0];
    };

    beforeAll(async () => {
        await connectDB();
        db = await getDB();

        // 1. Create unique compound index on bookings (fieldId + date + slot)
        await db.collection("bookings").createIndex(
            { fieldId: 1, date: 1, slot: 1 },
            { unique: true }
        );

        // 2. Register main test user & acquire JWT
        const mainUser = {
            username: `booking_owner_${Date.now()}`,
            password: "Password123!",
            name: "Booking",
            surname: "Owner",
        };
        await request(app).post("/api/1.0/auth/signup").send(mainUser);
        const mainAuth = await request(app)
            .post("/api/1.0/auth/signin")
            .send({ username: mainUser.username, password: mainUser.password });

        userToken = mainAuth.body.token;
        userId = mainAuth.body.userId || mainAuth.body.user?.id;

        // 3. Register a second user for ownership authorization tests
        const otherUser = {
            username: `other_user_${Date.now()}`,
            password: "Password123!",
            name: "Other",
            surname: "User",
        };
        await request(app).post("/api/1.0/auth/signup").send(otherUser);
        const otherAuth = await request(app)
            .post("/api/1.0/auth/signin")
            .send({ username: otherUser.username, password: otherUser.password });

        otherUserToken = otherAuth.body.token;

        // 4. Seed a test field matching YOUR schema
        const fieldResult = await db.collection("fields").insertOne({
            name: "Calcio Arena Milan",
            sport: "football",
            address: "Via dei Campi 12, Milano",
            slots: [
                "09:00-10:00",
                "10:00-11:00",
                "11:00-12:00",
                "15:00-16:00",
                "16:00-17:00",
                "17:00-18:00"
            ]
        });
        fieldId = fieldResult.insertedId.toString();
    });

    beforeEach(async () => {
        // Clear bookings between test cases
        await db.collection("bookings").deleteMany({});
    });

    afterAll(async () => {
        if (db) {
            await db.collection("fields").deleteMany({ _id: new ObjectId(fieldId) });
            await db.collection("users").deleteMany({ username: { $regex: /^(booking_owner|other_user)_/ } });
            await db.collection("bookings").deleteMany({});
            await db.client.close();
        }
    });

    // ==========================================
    // 1. GET /api/1.0/fields & GET /api/1.0/fields/:id
    // ==========================================
    describe("GET /api/1.0/fields", () => {
        it("should return a list of available sports fields", async () => {
            const res = await request(app).get("/api/1.0/fields");

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0]).toHaveProperty("_id");
            expect(res.body[0]).toHaveProperty("name");
            expect(res.body[0]).toHaveProperty("sport");
            expect(res.body[0]).toHaveProperty("address");
            expect(res.body[0]).toHaveProperty("slots");
        });

        it("should return detailed info for a valid field ID", async () => {
            const res = await request(app).get(`/api/1.0/fields/${fieldId}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("_id", fieldId);
            expect(res.body.name).toBe("Calcio Arena Milan");
            expect(res.body.sport).toBe("football");
        });

        it("should return 404 for a non-existent field ID", async () => {
            const fakeId = new ObjectId().toString();
            const res = await request(app).get(`/api/1.0/fields/${fakeId}`);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("error");
        });
    });

    // ==========================================
    // 2. GET /api/1.0/fields/:id/slots?date=YYYY-MM-DD
    // ==========================================
    describe("GET /api/1.0/fields/:id/slots", () => {
        it("should return predefined field slots mapped with booking availability", async () => {
            const futureDate = getFutureDate(3);

            // Seed an existing booking for slot "10:00-11:00"
            await db.collection("bookings").insertOne({
                fieldId: new ObjectId(fieldId),
                date: futureDate,
                slot: "10:00-11:00",
                userId: new ObjectId(userId),
                type: "standard",
            });

            const res = await request(app).get(`/api/1.0/fields/${fieldId}/slots?date=${futureDate}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);

            const slot10 = res.body.find((s) => s.slot === "10:00-11:00");
            const slot11 = res.body.find((s) => s.slot === "11:00-12:00");

            expect(slot10).toBeDefined();
            expect(slot10.available).toBe(false); // Should register as taken

            expect(slot11).toBeDefined();
            expect(slot11.available).toBe(true); // Should remain available
        });

        it("should return 400 if date query parameter is missing or invalid", async () => {
            const res = await request(app).get(`/api/1.0/fields/${fieldId}/slots`);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("error");
        });
    });

    // ==========================================
    // 3. POST /api/1.0/fields/:id/bookings
    // ==========================================
    describe("POST /api/1.0/fields/:id/bookings", () => {
        it("should create a booking successfully for a valid future date and field slot", async () => {
            const futureDate = getFutureDate(2);

            const res = await request(app)
                .post(`/api/1.0/fields/${fieldId}/bookings`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    date: futureDate,
                    slot: "15:00-16:00",
                    type: "standard",
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("_id");
            expect(res.body.slot).toBe("15:00-16:00");
            expect(res.body.date).toBe(futureDate);
        });

        it("should reject double booking on the same slot (unique index rule)", async () => {
            const futureDate = getFutureDate(2);
            const bookingData = { date: futureDate, slot: "16:00-17:00", type: "standard" };

            // First booking succeeds
            await request(app)
                .post(`/api/1.0/fields/${fieldId}/bookings`)
                .set("Authorization", `Bearer ${userToken}`)
                .send(bookingData);

            // Concurrent/subsequent double booking fails with 409 Conflict
            const conflictRes = await request(app)
                .post(`/api/1.0/fields/${fieldId}/bookings`)
                .set("Authorization", `Bearer ${otherUserToken}`)
                .send(bookingData);

            expect(conflictRes.status).toBe(409);
            expect(conflictRes.body).toHaveProperty("error");
        });

        it("should reject bookings for past dates", async () => {
            const pastDate = getPastDate(1);

            const res = await request(app)
                .post(`/api/1.0/fields/${fieldId}/bookings`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    date: pastDate,
                    slot: "17:00-18:00",
                    type: "standard",
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/future/i);
        });

        it("should enforce authentication requirement", async () => {
            const futureDate = getFutureDate(2);

            const res = await request(app)
                .post(`/api/1.0/fields/${fieldId}/bookings`)
                .send({
                    date: futureDate,
                    slot: "09:00-10:00",
                    type: "standard",
                });

            expect(res.status).toBe(401);
        });
    });

    // ==========================================
    // 4. DELETE /api/1.0/fields/:id/bookings/:bookingId
    // ==========================================
    describe("DELETE /api/1.0/fields/:id/bookings/:bookingId", () => {
        it("should allow a user to cancel their own future standard booking", async () => {
            const futureDate = getFutureDate(4);

            const insertRes = await db.collection("bookings").insertOne({
                fieldId: new ObjectId(fieldId),
                date: futureDate,
                slot: "11:00-12:00",
                userId: new ObjectId(userId),
                type: "standard",
            });
            const bookingId = insertRes.insertedId.toString();

            const res = await request(app)
                .delete(`/api/1.0/fields/${fieldId}/bookings/${bookingId}`)
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message");

            const deleted = await db.collection("bookings").findOne({ _id: new ObjectId(bookingId) });
            expect(deleted).toBeNull();
        });

        it("should prevent a user from deleting another user's booking", async () => {
            const futureDate = getFutureDate(4);

            const insertRes = await db.collection("bookings").insertOne({
                fieldId: new ObjectId(fieldId),
                date: futureDate,
                slot: "15:00-16:00",
                userId: new ObjectId(userId), // Owned by main user
                type: "standard",
            });
            const bookingId = insertRes.insertedId.toString();

            const res = await request(app)
                .delete(`/api/1.0/fields/${fieldId}/bookings/${bookingId}`)
                .set("Authorization", `Bearer ${otherUserToken}`);

            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty("error");
        });

        it("should restrict cancellation of tournament bookings", async () => {
            const futureDate = getFutureDate(5);

            const insertRes = await db.collection("bookings").insertOne({
                fieldId: new ObjectId(fieldId),
                date: futureDate,
                slot: "16:00-17:00",
                userId: new ObjectId(userId),
                type: "tournament",
            });
            const bookingId = insertRes.insertedId.toString();

            const res = await request(app)
                .delete(`/api/1.0/fields/${fieldId}/bookings/${bookingId}`)
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/tournament/i);
        });

        it("should prevent cancelling past bookings", async () => {
            const pastDate = getPastDate(2);

            const insertRes = await db.collection("bookings").insertOne({
                fieldId: new ObjectId(fieldId),
                date: pastDate,
                slot: "09:00-10:00",
                userId: new ObjectId(userId),
                type: "standard",
            });
            const bookingId = insertRes.insertedId.toString();

            const res = await request(app)
                .delete(`/api/1.0/fields/${fieldId}/bookings/${bookingId}`)
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/future/i);
        });
    });
});