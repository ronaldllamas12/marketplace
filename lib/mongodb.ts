import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
    throw new Error('Por favor, define la variable de entorno MONGODB_URI');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
    // En desarrollo, usa una variable global para que la conexión persista entre recargas
    const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, options);
        globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
} else {
    // En producción, es mejor no usar una variable global
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

export async function connectToDatabase() {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    return { client, db };
} 