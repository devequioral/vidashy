import { Montserrat, Roboto } from 'next/font/google';

const primary = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const secondary = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const fonts = { primary, secondary };

export default fonts;
