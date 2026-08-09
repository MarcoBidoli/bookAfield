import app from "./app.js";
import {connectDB} from "./db.js";

const PORT = process.env.PORT || 3000;

async function startApp() {
    try {
        console.log("Connecting to database...");
        await connectDB();
        console.log("Database connected!");

        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startApp();