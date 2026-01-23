import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "REFLEKTOR AI | Advanced Public Speaking Coach",
  description: "Master your communication with AI-powered feedback. Analyze gestures, eye contact, and filler words in real-time.",
  keywords: ["public speaking", "AI coach", "soft skills", "communication training", "speech analysis"],
  authors: [{ name: "REFLEKTOR Team" }],
  creator: "REFLEKTOR AI",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://reflektor.ai")
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "REFLEKTOR AI | Professional Public Speaking Coach",
    description: "Analyze your presentation and master your communication skills with real-time AI feedback.",
    url: "./",
    siteName: "Reflektor AI",
    images: [
      {
        url: "/og-image.png", // Should be created or provided
        width: 1200,
        height: 630,
        alt: "Reflektor AI Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "REFLEKTOR AI | Public Speaking Coach",
    description: "Master your communication with real-time AI feedback.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Match the reference HTML */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>

      <body
        className={`font-display antialiased min-h-screen flex flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white selection:bg-primary selection:text-background-dark`}
      >
        {children}
      </body>
    </html>
  );
}
