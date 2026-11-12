import type { Metadata } from "next";
import { AppProvider } from "@/context/AppContext";
import FlashMessage from "@/components/common/FlashMessage";

// El portal de gestión (login, admin, prestadores) no se indexa: la cara pública es la landing.
export const metadata: Metadata = {
  title: "ANDO - Portal de Gestión Turística",
  description: "Portal de administración y gestión para prestadores de servicios y administradores de ANDO.",
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AppProvider>
      {children}
      <FlashMessage />
    </AppProvider>
  );
}
