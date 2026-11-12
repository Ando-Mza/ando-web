import type { Metadata, Viewport } from "next";
import { Unbounded, Wix_Madefor_Display, Wix_Madefor_Text } from "next/font/google";
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
  title: "ANDO | Descubrí el Gran Mendoza a tu manera",
  description:
    "ANDO es la plataforma de planificación de viajes por Mendoza: armá tu itinerario a mano o con inteligencia artificial, explorá el mapa y recorré cada parada.",
  applicationName: "ANDO",
  appleWebApp: { title: "ANDO" },
};

// Color de la barra del navegador en móviles (Chrome Android, Safari).
export const viewport: Viewport = {
  themeColor: "#E96509",
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
        {children}
      </body>
    </html>
  );
}
