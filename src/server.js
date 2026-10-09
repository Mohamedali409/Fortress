import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 3000;

const strartServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running in port ${3000}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

strartServer();
