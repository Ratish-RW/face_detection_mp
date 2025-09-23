
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Face Detection Portal",
  description: "Mumbai police",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  // If using Next.js 13+ app router, use: const pathname = usePathname();
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-white relative`}
        style={{
          background: "linear-gradient(135deg, #000 0%, #0a1a3a 50%, #0e3a7a 100%)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Background image */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <img
            src="/assets/images/mp-bg.png"
            alt="Background"
            style={{
              maxWidth: "80vw",
              maxHeight: "100vh",
              opacity: 0.3,
              objectFit: "contain",
            }}
          />
        </div>

        <div
          className="hide-scrollbar"
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            width: "100%",
            textAlign: "center",
            height: "100vh",
            overflowY: "auto"
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
