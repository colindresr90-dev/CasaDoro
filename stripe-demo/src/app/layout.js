import { Inter, EB_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata = {
  title: "Casa d'Oro • Experiencia de Reserva Exclusiva",
  description: "Reserva tu estancia de barefoot luxury en Casa d'Oro con Stripe Checkout",
};

export default function RootLayout({ children }) {
  return (
    <html 
      lang="es" 
      className={`${inter.variable} ${ebGaramond.variable} h-full antialiased`}
      style={{ scrollBehavior: 'smooth' }}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#0a0805] text-[#f5f0e8] antialiased">
        {children}
      </body>
    </html>
  );
}
