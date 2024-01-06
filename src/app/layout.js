//import '@/styles/grid.css';
//import '@/styles/globals.css';
//import fonts from '@/app/ui/fonts';

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
