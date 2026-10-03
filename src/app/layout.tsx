import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";
import SiteFooter from "@/components/sajt/SiteFooter";
import SiteHeader from "@/components/sajt/SiteHeader";
import { SAJT } from "@/lib/sajt";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin", "latin-ext"],
  weight: ["700", "800"],
});

// Baloo 2 nema ćirilicu, pa ćirilični naslovi (knjižice su na ćirilici) idu na Nunito 800.
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SAJT.url),
  title: { default: "Igra Lab Biblioteka", template: "%s | Igra Lab" },
  description:
    "Interaktivne prezentacije i radni listovi za vaspitačice, uz svaku Igra Lab knjižicu. Za uzraste 3, 4, 5 i 6 godina.",
  openGraph: {
    title: "Igra Lab Biblioteka",
    description: "Interaktivne prezentacije i radni listovi za vaspitačice, za uzraste 3 do 6 godina.",
    images: ["/slajd-uparivanje.png"],
    locale: "sr_RS",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sr-Latn" className={`${baloo.variable} ${nunito.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
