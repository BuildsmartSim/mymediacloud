import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Navbar } from "@/components/ui/navbar";
import { TraktProvider } from "@/components/providers/trakt-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "ONYX | The Art of Cinema",
  description: "Your Private Cloud Media Center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${playfair.variable} font-sans min-h-screen bg-background text-foreground antialiased pb-10 cinema-grain`}>
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
