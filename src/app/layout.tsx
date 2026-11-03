import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus Vyoma — Admin Login",
  description: "ISLEC Event Management System Admin Login",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased light">
      <body className="min-h-full flex flex-col font-sans bg-white text-zinc-900">
        {children}
      </body>
    </html>
  );
}

