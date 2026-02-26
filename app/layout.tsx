import type { Metadata } from "next";
import { siteConfig } from "@/config";
import { Providers } from "@/components/providers";
import { avertaBlack, avertaBold, avertaRegular } from "./fonts/fonts";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: siteConfig.metadata.title,
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
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${avertaRegular.variable} ${avertaBlack.variable} ${avertaBold.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
