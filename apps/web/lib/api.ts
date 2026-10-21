import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig,} from "axios";
import type { ZodType } from "zod";
import { API_BASE_URL, apiErrorSchema } from "@nutriapp/shared";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly payload?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15_000,
});

type ApiRequestConfig<T> = Omit<AxiosRequestConfig, "url"> & {
  // Schema zod opcional para validar a resposta em runtime
  schema?: ZodType<T>;
};

export async function apiRequest<T>(
  path: string,
  { schema, ...config }: ApiRequestConfig<T> = {}
): Promise<T> {
  try {
    const { data } = await api.request<unknown>({ url: path, ...config });
    return schema ? schema.parse(data) : (data as T);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw toApiError(error);
    }
    throw error; // erro de validação do zod ou bug próprio
  }
}

function toApiError(error: AxiosError): ApiError {
  if (!error.response) {
    return error.code === "ECONNABORTED"
      ? new ApiError("A requisição demorou demais. Tente novamente.")
      : new ApiError("Não foi possível conectar à API.");
  }

  const parsed = apiErrorSchema.safeParse(error.response.data);
  return new ApiError(
    parsed.success ? parsed.data.mensagem : "A API retornou um erro.",
    error.response.status,
    error.response.data
  );
}

// ---------- Refresh de sessão ----------

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Rotas que nunca devem disparar refresh (senão entra em loop)
const AUTH_PATHS = ["/auth/login", "/auth/refresh"];

let refreshPromise: Promise<void> | null = null;

function refreshSession(): Promise<void> {
  // Todas as requisições que levarem 401 ao mesmo tempo compartilham UMA renovação
  // a API exige Content-Type: application/json em todo o POST por isso as {}, axios irá transformar e setar o header
  refreshPromise ??= axios
    .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true }) // axios "puro": não passa pelos interceptors
    .then(() => undefined)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

type SessionExpiredHandler = () => void;
let onSessionExpired: SessionExpiredHandler = () => {};

export function setSessionExpiredHandler(handler: SessionExpiredHandler) {
  onSessionExpired = handler;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;

    const shouldRefresh =
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !AUTH_PATHS.some((p) => original.url?.startsWith(p));

    if (!shouldRefresh) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      await refreshSession();
    } catch {
      onSessionExpired();
      return Promise.reject(error); // devolve o 401 original
    }

    return api.request(original); // refaz a requisição com o cookie novo
  }
);