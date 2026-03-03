import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config";
import { Providers } from "@/components/providers";
import { avertaBlack, avertaBold, avertaRegular } from "./fonts/fonts";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#4a25d6",
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: siteConfig.metadata.title,
    description: siteConfig.metadata.description,
    keywords: [...siteConfig.metadata.keywords],
    manifest: '/manifest.webmanifest',
    icons: {
      icon: '/logo.svg',
      shortcut: '/logo.svg',
      apple: '/logo.svg',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: siteConfig.metadata.title as string,
    },
    openGraph: {
      title: siteConfig.metadata.title,
      description: siteConfig.metadata.description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      images: [
        {
          url: '/logo.svg',
          width: 1200,
          height: 630,
          alt: siteConfig.metadata.title,
        },
      ],
      locale: 'es_MX',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.metadata.title,
      description: siteConfig.metadata.description,
      images: ['/logo.svg'],
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
