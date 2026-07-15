export const metadata = {
  title: "AI.it",
  description: "Capire la corsa all'intelligenza artificiale"
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
