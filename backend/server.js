require('dotenv').config();
const app = require('./src/app');

console.log("⚙️ [Server] Loading environment & initializing...");

const PORT = process.env.PORT || 5000;

// Check basic required environment variables
if (!process.env.PORT) {
  console.warn("⚠️ [Server] PORT not found in .env, using default:", PORT);
} else {
  console.log("📌 [Server] Port Loaded From .env:", process.env.PORT);
}

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 [Server] Running on port ${PORT}`);
  console.log("🌐 [Server] Ready to accept requests...");
});
