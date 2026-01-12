import { Inter } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/contexts/theme-context"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Zep Research | Discover, Publish & Share Research",
  description:
    "Zep Research is a global research publication platform to discover academic papers, connect with researchers, share publications, track citations, and advance scientific knowledge together.",
  keywords: [
    "research publications",
    "academic papers",
    "research platform",
    "scientific publications",
    "researchers network",
    "journals",
    "citations",
    "open research",
    "AI research",
    "data science research",
  ],
  authors: [{ name: "Zep Research" }],
  creator: "Zep Research",
  publisher: "Zep Research",
  metadataBase: new URL("https://publication.zepresearch.com"), // change if different
  openGraph: {
    title: "Zep Research | Discover Research Publications",
    description:
      "Connect with researchers worldwide, publish your work, track citations, and explore high-quality research publications on Zep Research.",
    url: "https://publication.zepresearch.com",
    siteName: "Zep Research",
    images: [
      {
        url: "/og-image.png", // add later
        width: 1200,
        height: 630,
        alt: "Zep Research Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zep Research | Research Publication Platform",
    description:
      "Publish, discover, and collaborate on academic research with researchers across the globe.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
