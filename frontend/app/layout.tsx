import './globals.css';
import { Auth0Provider } from '@auth0/nextjs-auth0';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <Auth0Provider>{children}</Auth0Provider>
      </body>
    </html>
  );
}