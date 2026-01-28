import { QuotationProvider } from "./context/QuotationContext";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QuotationProvider>{children}</QuotationProvider>
      </body>
    </html>
  );
}
