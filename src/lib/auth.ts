import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

// Resolve Windows IPv6/IPv4 MongoDB address gotchas and handle undefined URI
const mongoUri = process.env.MONGODB_URI || "mongodb+srv://prompt-nexus:aVgm7yLVgFo894oo@cluster0.vhfnndv.mongodb.net/documind?appName=Cluster0";
const cleanMongoUri = mongoUri.includes("localhost") 
  ? mongoUri.replace("localhost", "127.0.0.1") 
  : mongoUri;

const client = new MongoClient(cleanMongoUri);
const db = client.db("documind");

export const auth = betterAuth({
    // Disabling client option here disables transactions, allowing compatibility with standalone MongoDB local servers
    database: mongodbAdapter(db),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "placeholder_google_client_id",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder_google_client_secret",
        }
    },
    // Better Auth requires a secret to sign tokens. We define a fallback in case BETTER_AUTH_SECRET is not in .env.
    secret: process.env.BETTER_AUTH_SECRET || "documind_better_auth_fallback_secret_98765",
    
    // Better Auth uses this to construct redirect URIs. We default to localhost:3000.
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});
export default auth;
