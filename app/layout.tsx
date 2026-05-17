import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { VoiceAssistant } from "@/components/voice/voice-assistant";

export const metadata: Metadata = {
  title: "Dr Crops · AI crop doctor for Pakistan",
  description:
    "Snap a photo of any leaf — get the disease, severity and treatment plan in seconds. Built for wheat, rice, cotton, sugarcane and mango farmers across Pakistan.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#000000"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin=""
        />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
        />
      </head>
      <body className="bg-bg-base text-ink min-h-screen antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <VoiceAssistant />
      </body>
    </html>
  );
}
