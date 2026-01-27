import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/ui/navbar";
import { TraktProvider } from "@/components/providers/trakt-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CloudStream Premium",
  description: "Your Private Cloud Media Center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased pb-10`}>
        <TraktProvider>
          <Navbar />
          <main className="pt-20"> {/* Offset for fixed navbar */}
            {children}
          </main>
        </TraktProvider>
      </body>
    </html>
  );
}
