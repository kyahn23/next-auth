import { MongoClient } from "mongodb";

export async function connectToDatabase() {
  const client = new MongoClient(
    "mongodb+srv://kyahn:3j3IwKSAIYw6nj50@cluster0.7jehjja.mongodb.net/?retryWrites=true&w=majority"
  );

  return client;
}
