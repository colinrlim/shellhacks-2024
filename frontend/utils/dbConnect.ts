import mongoose from "mongoose";

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached: {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore This error is thrown for no reason
} = global.mongoose;

if (!cached) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore This error is thrown for no reason
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      // Add other options if needed
    };

    cached.promise = mongoose
      .connect(MONGODB_URI || "", opts)
      .then((mongoose) => {
        return mongoose;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
