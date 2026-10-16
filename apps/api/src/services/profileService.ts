import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import type { AuthRepository } from "../repositories/authRepository.js";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"]
]);

export type LogoUpload = {
  filename: string;
  mimetype: string;
  file: NodeJS.ReadableStream;
};

export type LogoStorage = {
  upload: (input: { nutritionistId: string; filename: string; mimetype: string; file: NodeJS.ReadableStream }) => Promise<string>;
};

export function createS3LogoStorage(client = new S3Client({ region: process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION })) {
  return {
    async upload(input: LogoUpload & { nutritionistId: string }): Promise<string> {
      const extension = allowedTypes.get(input.mimetype);
      const bucket = process.env.S3_BUCKET;
      if (!extension || !bucket) throw new Error("S3_BUCKET e um tipo de imagem válido são obrigatórios.");
      const body = await streamToBuffer(input.file);
      if (body.byteLength > MAX_LOGO_BYTES) throw new Error("A logo deve ter no máximo 5 MB.");
      const key = `logos/${input.nutritionistId}/${randomUUID()}.${extension}`;
      await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: input.mimetype
      }));
      return key;
    }
  } satisfies LogoStorage;
}

export function createProfileService(repository: AuthRepository, storage: LogoStorage) {
  return {
    async getProfile(sessionId: string) {
      const nutritionistId = await repository.findSessionOwner(sessionId);
      return nutritionistId ? repository.findProfile(nutritionistId) : null;
    },
    async updateProfile(sessionId: string, data: { nome?: string; crn?: string | null }) {
      const nutritionistId = await repository.findSessionOwner(sessionId);
      if (!nutritionistId) return null;
      return repository.updateProfile(nutritionistId, data);
    },
    async uploadLogo(sessionId: string, upload: LogoUpload) {
      const nutritionistId = await repository.findSessionOwner(sessionId);
      if (!nutritionistId) return null;
      const logoPath = await storage.upload({ ...upload, nutritionistId });
      return repository.updateProfile(nutritionistId, { logoPath });
    }
  };
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string | Uint8Array));
    if (chunks.reduce((total, item) => total + item.byteLength, 0) > MAX_LOGO_BYTES) {
      throw new Error("A logo deve ter no máximo 5 MB.");
    }
  }
  return Buffer.concat(chunks);
}

export type ProfileService = ReturnType<typeof createProfileService>;
