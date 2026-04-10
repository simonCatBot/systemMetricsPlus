import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "System Metrics Plus",
  description: "Real-time system monitoring dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
