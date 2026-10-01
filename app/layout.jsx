import { Inter, Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import { ViewTransitions } from "next-view-transitions";
import Providers from "@/components/providers/Providers";
import SceneMount from "@/components/scene/SceneMount";
import ScrollSceneSync from "@/components/scene/ScrollSceneSync";
import Grain from "@/components/ui/Grain";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import Cursor from "@/components/ui/Cursor";
import CommandPalette from "@/components/ui/CommandPalette";
import ScrollProgress from "@/components/ui/ScrollProgress";
import Loader from "@/components/ui/Loader";
import { loaderScript } from "@/lib/loader-script";
import { site } from "@/content/site";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const sans = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = localFont({
  src: "../fonts/Ubuntu-Mono-bold.woff2",
  variable: "--font-ubuntu-mono",
  weight: "700",
});

export const metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — AI/ML & Full-stack Developer`, template: `%s — ${site.name}` },
  description: site.about.headline,
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#05060a" },
    { media: "(prefers-color-scheme: light)", color: "#f6f4ef" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${display.variable} ${sans.variable} ${mono.variable}`}
      >
        <head>
          <script dangerouslySetInnerHTML={{ __html: loaderScript }} />
        </head>
        <body className="bg-bg font-sans text-fg antialiased">
          <a href="#main" className="skip-link">Skip to content</a>
          <Providers>
            <Loader />
            <SceneMount />
            <ScrollSceneSync />
            <Nav />
            <main id="main" className="relative z-10">{children}</main>
            <Footer />
            <ScrollProgress />
            <Grain />
            <Cursor />
            <CommandPalette />
          </Providers>
        </body>
      </html>
    </ViewTransitions>
  );
}
