import localFont from "next/font/local";
import { DEFAULT_TYPOGRAPHY } from "@/config/fonts.config";

export const avertaRegular = localFont({
  src: "./local/averta-regular.otf",
  variable: "--font-averta-regular",
  display: "swap",
});

export const avertaBlack = localFont({
  src: "./local/averta black.otf",
  variable: "--font-averta-black",
  display: "swap",
});

export const avertaBold = localFont({
  src: "./local/averta-bold.otf",
  variable: "--font-averta-bold",
  display: "swap",
});

export const defaultTypography = DEFAULT_TYPOGRAPHY;

export const fonts = {
  avertaRegular,
  avertaBlack,
  avertaBold,
};