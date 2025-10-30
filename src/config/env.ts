import "dotenv/config";

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parseInt(process.env.PORT ?? "4000", 10),
  MONGO_URI:
    process.env.MONGO_URI ??
    "mongodb+srv://kath:NBz1FvleLaBGSt8o@clusterkath.ovwkv.mongodb.net/?retryWrites=true&w=majority&appName=Clusterkath",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "*",
} as const;
