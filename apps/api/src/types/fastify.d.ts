import "fastify";
import type { readAccessToken } from "../controllers/authController.js";

declare module "fastify" {
  interface FastifyRequest {
    authSession: NonNullable<ReturnType<typeof readAccessToken>> | null;
  }
}