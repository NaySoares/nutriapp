"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setSessionExpiredHandler } from "../lib/api";

export function AuthBoundary({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    setSessionExpiredHandler(() => router.replace("/login"));
    return () => setSessionExpiredHandler(() => {});
  }, [router]);

  return <>{children}</>;
}