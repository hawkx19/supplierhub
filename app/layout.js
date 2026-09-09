import "./globals.css";

export const metadata = {
  title: "SupplierHub — Local Supply, Upgraded.",
  description:
    "A modern digital storefront and inventory hub for local suppliers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
