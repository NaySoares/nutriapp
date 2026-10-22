import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { settingsSchema } from "@nutriapp/shared";
import type { ProfileService } from "../services/profileService.js";
import { requireSession } from "../middleware/authenticate.js";

const profileSchema = z.object({
  nome: z.string().trim().min(1).max(120).optional(),
  crn: z.string().trim().max(30).nullable().optional()
}).refine((value) => value.nome !== undefined || value.crn !== undefined, {
  message: "Informe ao menos nome ou CRN."
});

export function createProfileController(service: ProfileService) {
  return {
    get: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);
      const profile = await service.getProfile(sessionId);
      if (!profile) return reply.status(404).send({ codigo: "NAO_ENCONTRADO", mensagem: "Perfil não encontrado." });

      return reply.send({ nutricionista: profile });
    },

    update: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);
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
      const sessionId = requireSession(request);
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
    },

    getSettings: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);
      const settings = await service.getSettings(sessionId);
      if (!settings) return unauthorized(reply);
      return reply.send({ configuracoes: settings });
    },

    updateSettings: async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = requireSession(request);
      const input = settingsSchema.safeParse(request.body);
      if (!input.success) return reply.status(400).send({
        codigo: "VALIDACAO_INVALIDA",
        mensagem: "Os dados enviados são inválidos.",
        detalhes: input.error.flatten()
      });
      const settings = await service.updateSettings(sessionId, input.data);
      if (!settings) return unauthorized(reply);
      return reply.send({ configuracoes: settings });
    }
  };
}


function unauthorized(reply: FastifyReply) {
  return reply.status(401).send({ codigo: "NAO_AUTENTICADO", mensagem: "É necessário estar autenticado." });
}
