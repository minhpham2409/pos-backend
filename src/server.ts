import app from "./app";
import { connectDatabase } from "./config/database";

async function startServer() {
  try {
    connectDatabase()
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
}

startServer();