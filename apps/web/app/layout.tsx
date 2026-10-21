import type { Metadata } from "next";
import "./globals.css";
import { Header } from "../components/header";
import { Footer } from "../components/footer";

export const metadata: Metadata = {
  title: "Salga App",
  description: "Gestão nutricional para profissionais"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{metadata.title as string}</title>
        <meta name="description" content={metadata.description as string} />
      </head>
      <body>
        {/* <Header /> */}
        {children}
        <Footer />
      </body>
    </html>
  );
}
