const { MongoClient } = require("mongodb");

async function run() {
  let client;
  try {
    const mongoUri = "mongodb+srv://prompt-nexus:aVgm7yLVgFo894oo@cluster0.vhfnndv.mongodb.net/documind?appName=Cluster0";
    client = new MongoClient(mongoUri);
    await client.connect();
    console.log("Connected to MongoDB Atlas.");
    
    const db = client.db("documind");
    
    console.log("\n--- Collections List ---");
    const collections = await db.listCollections().toArray();
    console.log(collections.map(c => c.name));
    
    console.log("\n--- Users (First 5) ---");
    const users = await db.collection("user").find({}).limit(5).toArray();
    console.log(users.map(u => ({ id: u.id, _id: u._id, email: u.email, name: u.name })));
    
    console.log("\n--- Sessions (First 5) ---");
    const sessions = await db.collection("session").find({}).limit(5).toArray();
    console.log(sessions.map(s => ({
      id: s.id,
      _id: s._id,
      userId: s.userId,
      token: s.token,
      expiresAt: s.expiresAt
    })));
    
  } catch (error) {
    console.error("Diagnostic failed:", error);
  } finally {
    if (client) {
      await client.close();
      console.log("\nConnection closed.");
    }
  }
}

run();
