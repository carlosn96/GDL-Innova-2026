import type { Metadata } from "next";
import { siteConfig } from "@/config";
import { Providers } from "@/components/providers";
import { ThemeConfigurator } from "@/components/ThemeConfigurator";
import { getThemeBootstrapScript } from "@/lib/theme-bootstrap";
import { fetchThemeSnapshot, snapshotToCSS } from "@/lib/theme-css.server";
import { inter } from "./fonts/fonts";
import "./globals.css";

const hasThemeDB = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
);

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = hasThemeDB ? await fetchThemeSnapshot() : null;
  const eventName = snapshot?.eventName;

  return {
    title: eventName
      ? `${eventName} — Estrategia de Co-Creación Interdisciplinaria IA`
      : siteConfig.metadata.title,
    description: siteConfig.metadata.description,
    keywords: [...siteConfig.metadata.keywords],
    icons: {
      icon: '/logo.svg',
      shortcut: '/logo.svg',
      apple: '/logo.svg',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const snapshot = hasThemeDB ? await fetchThemeSnapshot() : null;
  // CSS inlineado en el HTML: sin petición de red extra, sin flash posible
  const inlineThemeCSS = snapshot ? snapshotToCSS(snapshot) : null;
  // Snapshot serializado para que ThemeConfigurator lo use como estado inicial
  // Evita que inicialice con defaults y cause flash al pisar el CSS del servidor
  const serializedSnapshot = snapshot ? JSON.stringify(snapshot) : null;

  const initialConfig = snapshot?.eventName
    ? { name: snapshot.eventName }
    : undefined;

  return (
    <html lang="es" className="scroll-smooth">
      <head>
        {/* Snapshot del servidor disponible antes de que React hidrate */}
        {serializedSnapshot && (
          <script id="gdlinova-snapshot" dangerouslySetInnerHTML={{ __html: `window.__gdlinovaSnapshot=${serializedSnapshot};` }} />
        )}
        {/* Bootstrap solo corre si no hay tema del servidor; evita que localStorage
            (inline style) sobreescriba el CSS de RTDB */}
        {!inlineThemeCSS && (
          <script id="theme-bootstrap" dangerouslySetInnerHTML={{ __html: getThemeBootstrapScript() }} />
        )}
        {inlineThemeCSS && (
          // Tema guardado en RTDB inyectado directamente — zero red, zero flash
          <style id="rtdb-theme" dangerouslySetInnerHTML={{ __html: inlineThemeCSS }} />
        )}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Providers initialConfig={initialConfig}>
          {children}
          <ThemeConfigurator />
        </Providers>
      </body>
    </html>
  );
}
