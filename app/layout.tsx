import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  applicationName: "recliner",
  title: "recliner - API Client for Resend Email Service",
  description:
    "recliner is an API client for Resend Email Service. It helps you send emails using the Resend API.",
  keywords:
    "recliner, resend, email, api, client, pujan, pujan modha, pujan.pm",
  icons: {
    icon: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: `/favicon-16x16.png`,
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: `/favicon-32x32.png`,
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "48x48",
        url: `/android-chrome-48x48.png`,
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "96x96",
        url: `/android-chrome-96x96.png`,
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        url: `/apple-touch-icon.png`,
      },
      {
        rel: "mask-icon",
        color: "#101010",
        url: `/safari-pinned-tab.svg`,
      },
    ],
    apple: [
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        url: `/apple-touch-icon.png`,
        href: `/apple-touch-icon.png`,
      },
      {
        rel: "mask-icon",
        color: "#101010",
        url: `/safari-pinned-tab.svg`,
        href: `/safari-pinned-tab.svg`,
      },
    ],
    other: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "144x144",
        url: `/android-chrome-144x144.png`,
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        url: `/android-chrome-192x192.png`,
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "256x256",
        url: `/android-chrome-256x256.png`,
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        url: `/android-chrome-512x512.png`,
      },
    ],
  },
  openGraph: {
    title: "recliner",
    description:
      "recliner is an API client for Resend Email Service. It helps you send emails using the Resend API.",
    siteName: "recliner",
    locale: "en_IN",
    type: "website",
    images: [
      {
        type: "image/png",
        url: `/android-chrome-192x192.png`,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  manifest: `/site.webmanifest`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
