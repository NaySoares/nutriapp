import { useRef } from "react";

// dentro do componente
const attempt = useRef<{ key: string; fingerprint: string } | null>(null);

function getIdempotencyKeyAppointment(payload: NewAppointmentPayload) {
  const fingerprint = JSON.stringify(payload);
  // Mesmos dados = mesma chave (reenvio/duplo clique). Dados diferentes = nova chave.
  if (!attempt.current || attempt.current.fingerprint !== fingerprint) {
    attempt.current = { key: crypto.randomUUID(), fingerprint };
  }
  return attempt.current.key;
}