import type { Metadata } from "next";
import { Unbounded, Wix_Madefor_Display, Wix_Madefor_Text } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["700"],
});

const wixDisplay = Wix_Madefor_Display({
  variable: "--font-wix-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const wixText = Wix_Madefor_Text({
  variable: "--font-wix-text",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "ANDO - Portal de Gestión Turística",
  description: "Portal de administración y gestión para prestadores de servicios y administradores de ANDO.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${unbounded.variable} ${wixDisplay.variable} ${wixText.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-wixText bg-bgPrimary text-textDark">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
