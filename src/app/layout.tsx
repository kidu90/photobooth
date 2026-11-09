import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pose — Everyone in.",
  description: "Open the booth, squeeze in, and get your strip in seconds. Four shots, one photo strip, ready to share.",
  icons: { icon: { url: "/brand/pose-app-icon.svg", type: "image/svg+xml" } },
};

export const viewport: Viewport = {
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- fonts come from the design system's Google Fonts link */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=Instrument+Sans:wght@400;600&display=swap"
        />
      </head>
      <body>
        <a href="#main" className="skip-link t-label">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
