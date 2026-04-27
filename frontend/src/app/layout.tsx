import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "INSA Education Module",
  description: "Education Module for INSA HR Training ERP System",
  icons: {
    icon: "/INSA_LOGO.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.className} min-h-screen bg-[var(--background)] text-[var(--foreground)]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
