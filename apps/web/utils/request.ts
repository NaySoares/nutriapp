import { useRef } from "react";

// TODO: Implementar um mecanismo de idempotência generico que possa ser usado em qualquer requisição.

function getIdempotencyKeyAppointment(payload: Record<string, unknown>) {
  // const attempt = useRef<{ key: string; fingerprint: string } | null>(null);

  // const fingerprint = JSON.stringify(payload);
  // // Mesmos dados = mesma chave (reenvio/duplo clique). Dados diferentes = nova chave.
  // if (!attempt.current || attempt.current.fingerprint !== fingerprint) {
  //   attempt.current = { key: crypto.randomUUID(), fingerprint };
  // }
  // return attempt.current.key;
}