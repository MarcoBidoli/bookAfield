import express from "express";
import {connectDB} from "./db.js";
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', function(req, res) {
    res.send('Hello bookAfield!')
});

async function startApp() {
    try {
        console.log("Connecting to database...");
        await connectDB();
        console.log("Database connected! Starting server...");
        app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startApp();