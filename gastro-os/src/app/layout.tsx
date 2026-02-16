import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GastroOS - ERP para Restaurantes",
  description: "Sistema de gestión integral para restaurantes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
