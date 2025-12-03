import { z } from "zod";

const envSchema = z.object({
  INVENTORY_API_URL: z.url(),
});

export const env = envSchema.parse({
  INVENTORY_API_URL: process.env.INVENTORY_API_URL,
});
