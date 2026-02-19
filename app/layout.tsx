import type { Metadata } from "next";
import { siteConfig } from "@/config";
import { Providers } from "@/components/providers";
import { ThemeConfigurator } from "@/components/ThemeConfigurator";
import { getThemeBootstrapScript } from "@/lib/theme-bootstrap";
import { inter } from "./fonts/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: siteConfig.metadata.title,
  description: siteConfig.metadata.description,
  keywords: [...siteConfig.metadata.keywords],
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <script id="theme-bootstrap" dangerouslySetInnerHTML={{ __html: getThemeBootstrapScript() }} />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          {children}
          <ThemeConfigurator />
        </Providers>
      </body>
    </html>
  );
}
