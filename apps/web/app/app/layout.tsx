'use client';

import "./../globals.css";
import { SideBar } from "../../components/layout/sidebar";
import { useState } from "react";
import { HeaderApp } from "../../components/layout/header";
import { Toaster } from "sonner";
import { AuthBoundary } from "../../components/auth-boundary";
import { ModalHost } from "../../components/ui/modal/modal-host";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Salga App</title>
        <meta name="description" content="Gestão nutricional para profissionais" />
      </head>
      <body>
        <AuthBoundary>
          <Toaster position="top-right" richColors />
          <ModalHost />

          <div className="min-h-screen">
            <SideBar open={sidebarOpen} onClose={() => setSidebarOpen(!sidebarOpen)} />
            <div>
              <HeaderApp onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
              {children}
            </div>
          </div>
        </AuthBoundary>
      </body>
    </html>
  );
}
