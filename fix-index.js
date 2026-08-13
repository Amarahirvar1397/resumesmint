const mongoose = require("mongoose");
require("dotenv").config();

async function fixIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("users");

    // Drop the username index
    try {
      await collection.dropIndex("username_1");
      console.log("✅ Dropped username_1 index");
    } catch (error) {
      if (error.code === 26) {
        console.log("ℹ️  username_1 index does not exist");
      } else {
        console.log("❌ Error dropping index:", error.message);
      }
    }

    // Check remaining indexes
    const indexes = await collection.indexes();
    console.log("Current indexes:", indexes);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixIndex();
