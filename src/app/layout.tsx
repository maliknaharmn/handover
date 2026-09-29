import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Handover KODISIA",
  description: "Ruang transfer pengetahuan dan transisi kepengurusan KODISIA.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="antialiased">
      <body>{children}</body>
    </html>
  );
}
