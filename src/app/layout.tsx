import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "REFLEKTOR",
  description: "Advanced AI Coaching for Public Speaking",
  manifest: "/manifest.json",
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
