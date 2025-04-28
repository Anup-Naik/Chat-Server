import { config } from "dotenv";

config();

export const cors = { whitelist: ["http://127.0.0.1:5000"] };
export const envVars = ["MONGO_URL", "JWT_SECRET"];

export const validateEnv = () => {
  for (const envVar of envVars) {
    if (!process.env[envVar]) {
      console.error(`Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  }
};

export const server = {
  port: Number(process.env.PORT) || 3000,
  host: "0.0.0.0",
};

export const db = { mongoUrl: process.env.MONGO_URL! };

export const auth = {
  jwtSecret: process.env.JWT_SECRET!,
};
