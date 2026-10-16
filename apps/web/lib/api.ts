import { API_BASE_URL, apiErrorSchema } from "@nutriapp/shared";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: init?.body instanceof FormData
      ? init.headers
      : { "Content-Type": "application/json", ...init?.headers }
  });
  const payload: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    const parsed = apiErrorSchema.safeParse(payload);
    throw new Error(parsed.success ? parsed.data.mensagem : "A API retornou um erro.");
  }
  return payload as T;
}
