"use strict";

require("dotenv").config();
const app = require("./src/app");

console.log("⚙️ [Server] Initializing...");


const DEFAULT_PORT = 5000;
const PORT = Number(process.env.PORT) || DEFAULT_PORT;

if (!process.env.PORT) {
  console.warn(`⚠️ [Env] PORT missing in .env. Using default: ${DEFAULT_PORT}`);
} else {
  console.log(`📌 [Env] PORT loaded: ${process.env.PORT}`);
}

app.listen(PORT, (error) => {
  if (error) {
    console.error("❌ [Server] Failed to start:", error.message);
    process.exit(1);
  }

  console.log(`🚀 [Server] Running on port: ${PORT}`);
  console.log("🌐 [Server] Ready to accept requests...");
});
