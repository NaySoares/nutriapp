import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

export type PasswordResetEmail = {
  to: string;
  token: string;
};

function appUrl(): string {
  const value = process.env.APP_URL;
  if (!value || !/^https?:\/\/[^/\s]+(?:\/[^/\s]*)?$/.test(value)) {
    throw new Error("APP_URL deve ser uma URL HTTP(S) válida.");
  }
  return value.replace(/\/$/, "");
}

function sesFrom(): string {
  const value = process.env.SES_FROM;
  if (!value) throw new Error("SES_FROM não configurado.");
  return value;
}

export async function sendPasswordResetEmail({ to, token }: PasswordResetEmail): Promise<void> {
  const client = new SESv2Client({ region: process.env.SES_REGION ?? process.env.AWS_DEFAULT_REGION });
  const link = `${appUrl()}/redefinir-senha?token=${encodeURIComponent(token)}`;
  await client.send(new SendEmailCommand({
    FromEmailAddress: sesFrom(),
    Destination: { ToAddresses: [to] },
    Content: {
      Simple: {
        Subject: { Data: "Redefinição de senha — NutriApp", Charset: "UTF-8" },
        Body: {
          Text: {
            Data: `Solicitamos a redefinição da sua senha. Acesse: ${link}\n\nO link expira em 1 hora. Se você não fez esta solicitação, ignore este e-mail.`,
            Charset: "UTF-8"
          },
          Html: {
            Data: `<p>Solicitamos a redefinição da sua senha.</p><p><a href="${link}">Redefinir senha</a></p><p>O link expira em 1 hora. Se você não fez esta solicitação, ignore este e-mail.</p>`,
            Charset: "UTF-8"
          }
        }
      }
    }
  }));
}
