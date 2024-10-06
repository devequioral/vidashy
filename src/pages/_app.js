import '@/styles/grid.css';
import '@/styles/globals.css';

import { AppProvider } from '@/contexts/AppContext';
import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { NextUIProvider } from '@nextui-org/react';

import { Montserrat } from 'next/font/google';
import { Roboto } from 'next/font/google';

const primary_font = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const secondary_font = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <>
      <style jsx global>{`
        :root {
          --color-white: #fafbff;
          --color-black: #141519;
          --color-primary: #862873;
          --color-secondary: #1992ce;

          --primary-font: ${primary_font.style.fontFamily};
          --secondary-font: ${secondary_font.style.fontFamily};
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
      `}</style>
      <SessionProvider session={session}>
        {Component.auth ? (
          <Auth adminOnly={Component.auth.adminOnly}>
            <AppProvider>
              <NextUIProvider>
                <Component {...pageProps} />
              </NextUIProvider>
            </AppProvider>
          </Auth>
        ) : (
          <AppProvider>
            <NextUIProvider>
              <Component {...pageProps} />
            </NextUIProvider>
          </AppProvider>
        )}
      </SessionProvider>
    </>
  );
}

function Auth({ children, adminOnly }) {
  const router = useRouter();
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login?message=login required');
    },
  });
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  if (adminOnly && session.user.role !== 'admin') {
    router.push('/login?message=Access Denied');
  }

  return children;
}
