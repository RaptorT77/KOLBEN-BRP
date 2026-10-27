import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#173D60",
};

export const metadata: Metadata = {
  title: "Relación de mantenimientos preventivos Linea \"E\" Producto 9X3",
  description: "Dashboard ejecutivo oficial para visualización y actualización del estado de actividades de mantenimiento de la Línea E (Producto 9X3).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full bg-corporate-bg text-corporate-text overflow-x-hidden lg:overflow-hidden font-sans">
        {children}
      </body>
    </html>
  );
}
