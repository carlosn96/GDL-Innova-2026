import { Inter } from "next/font/google";
import { DEFAULT_TYPOGRAPHY } from "@/config/fonts.config";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const defaultTypography = DEFAULT_TYPOGRAPHY;

export const fonts = {
  inter,
};