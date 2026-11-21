import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SearchModal } from "@/components/SearchModal";
import { TrailerModal } from "@/components/TrailerModal";
import { AnimeAppProvider } from "@/context/AnimeAppContext";
import { siteUrl } from "./site-url";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "AniVFX - Khám phá Anime & Xem Trailer Trực Tuyến",
    template: "%s | AniVFX",
  },
  description:
    "Giao diện khám phá anime thế hệ mới, tổng hợp dữ liệu AniList, theo dõi mùa phim, lịch sử xem, và stream anime chất lượng cao.",
  keywords: [
    "AniVFX",
    "Anime",
    "AniList",
    "Xem anime",
    "Anime Vietsub",
    "Trailer Anime",
    "Nguyen Hoang Nam",
    "hnamhocit",
    "Otaku",
  ],
  authors: [{ name: "Nguyen Hoang Nam", url: "https://hnamhocit.vercel.app" }],
  creator: "Nguyen Hoang Nam",
  publisher: "AniVFX by Nguyen Hoang Nam",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: siteUrl,
    siteName: "AniVFX",
    title: "AniVFX - Khám phá Anime & Xem Trailer Trực Tuyến",
    description:
      "Khám phá anime thế hệ mới với dữ liệu AniList phong phú, theo dõi tập phim và trải nghiệm xem mượt mà.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AniVFX - Khám phá Anime & Xem Trailer Trực Tuyến",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AniVFX - Khám phá Anime & Xem Trailer Trực Tuyến",
    description:
      "Khám phá anime thế hệ mới với dữ liệu AniList phong phú và trải nghiệm xem mượt mà.",
    creator: "@hnamhocit",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${plusJakarta.variable} h-full antialiased dark font-sans`}
    >
      <head>
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0b0c10] text-zinc-100 selection:bg-[#7950f2] selection:text-white font-sans text-base leading-relaxed">
        <AnimeAppProvider>
          {children}
          <TrailerModal />
          <SearchModal />
          <ScrollToTop />
        </AnimeAppProvider>
      </body>
    </html>
  );
}
