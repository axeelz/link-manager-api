import "dotenv/config";

interface Env {
  TURSO_CONNECTION_URL: string;
  TURSO_AUTH_TOKEN: string;
  API_KEY: string;
  PORT: number;
  NODE_ENV: string;
}

function validateEnv(): Env {
  const requiredVars = ["TURSO_CONNECTION_URL", "TURSO_AUTH_TOKEN", "API_KEY"] as const;

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }

  return {
    TURSO_CONNECTION_URL: process.env.TURSO_CONNECTION_URL!,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN!,
    API_KEY: process.env.API_KEY!,
    PORT: 3500,
    NODE_ENV: process.env.NODE_ENV || "development",
  };
}

export const env = validateEnv();
