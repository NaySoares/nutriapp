import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { ACCESS_COOKIE, readAccessToken } from "./authController.js";
import type { ProfileService } from "../services/profileService.js";

const profileSchema = z.object({
  nome: z.string().trim().min(1).max(120).optional(),
  crn: z.string().trim().max(30).nullable().optional()
}).refine((value) => value.nome !== undefined || value.crn !== undefined, {
  message: "Informe ao menos nome ou CRN."
});

export function createProfileController(service: ProfileService) {
  return {
    get: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = authenticatedId(request);
      if (!sessionId) return unauthorized(reply);
      const profile = await service.getProfile(sessionId);
      if (!profile) return reply.status(404).send({ codigo: "NAO_ENCONTRADO", mensagem: "Perfil não encontrado." });
      return reply.send({ nutricionista: profile });
    },
    update: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = authenticatedId(request);
      if (!sessionId) return unauthorized(reply);
      const input = profileSchema.safeParse(request.body);
      if (!input.success) return reply.status(400).send({
        codigo: "VALIDACAO_INVALIDA",
        mensagem: "Os dados enviados são inválidos.",
        detalhes: input.error.flatten()
      });
      const profile = await service.updateProfile(sessionId, input.data);
      if (!profile) return unauthorized(reply);
      return reply.send({ nutricionista: profile });
    },
    uploadLogo: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = authenticatedId(request);
      if (!sessionId) return unauthorized(reply);
      const file = await request.file();
      if (!file) return reply.status(400).send({ codigo: "ARQUIVO_AUSENTE", mensagem: "Envie uma imagem para a logo." });
      try {
        const profile = await service.uploadLogo(sessionId, {
          filename: file.filename,
          mimetype: file.mimetype,
          file: file.file
        });
        if (!profile) return unauthorized(reply);
        return reply.send({ nutricionista: profile });
      } catch (error) {
        if (error instanceof Error && /obrigatórios|no máximo|tipo de imagem/.test(error.message)) {
          return reply.status(400).send({ codigo: "LOGO_INVALIDA", mensagem: error.message });
        }
        throw error;
      }
    }
  };
}

function authenticatedId(request: FastifyRequest): string | undefined {
  return readAccessToken(request.cookies[ACCESS_COOKIE]);
}

function unauthorized(reply: FastifyReply) {
  return reply.status(401).send({ codigo: "NAO_AUTENTICADO", mensagem: "É necessário estar autenticado." });
}
