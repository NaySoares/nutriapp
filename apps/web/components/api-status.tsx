"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

type Health = { status: "ok"; service: "api" };

export function ApiStatus() {
  const [message, setMessage] = useState("Verificando a API...");

  useEffect(() => {
    void apiFetch<Health>("/health")
      .then((health) => setMessage(`${health.service}: ${health.status}`))
      .catch(() => setMessage("API indisponível"));
  }, []);

  return <p className="mt-8 inline-flex rounded-full bg-white px-4 py-2 text-sm shadow-sm">{message}</p>;
}
