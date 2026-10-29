import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PANA · Pan recién hecho, cerca de ti",
  description: "Reserva tu pan con cariño y retíralo sin hacer fila."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-CL"><body>{children}</body></html>;
}
