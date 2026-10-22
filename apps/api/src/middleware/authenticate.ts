import type { FastifyReply, FastifyRequest } from "fastify";
import { ACCESS_COOKIE, readAccessToken } from "../controllers/authController.js";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const session = readAccessToken(request.cookies[ACCESS_COOKIE]);

  if (!session) {
    return reply.status(401).send({
      codigo: "NAO_AUTENTICADO",
      mensagem: "É necessário estar autenticado."
    });
  }

  request.authSession = session;
}

export function requireSession(request: FastifyRequest): string {
  if (!request.authSession) {
    throw Object.assign(new Error("É necessário estar autenticado."), { statusCode: 401 });
  }
  return request.authSession;
}