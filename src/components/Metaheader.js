import React from 'react';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GAScript from '@/components/GAScript';
import { useRouter } from 'next/router';

export default function Metaheader({
  title = 'Virtel Dashboard | Virtel',
  description = 'virtel Dashboard',
  keywords = 'nextjs dashboard',
  og_image = '/assets/images/og/og.jpg',
  yoast_head = false,
  author = 'Virtel',
  link = '',
  domain = 'virtel.co',
  twitter = '@virtel',
  noindex = false,
}) {
  const router = useRouter();
  link = link !== '' ? link : process.env.NEXT_PUBLIC_SITE_URL + router.asPath;
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
        <base href="" target="_self" />
        {yoast_head ? ( //IF YOAST HEAD IS TRUE, THEN SHOW THE YOAST HEAD
          <>
            <title>{yoast_head.title}</title>
            <meta name="description" content={yoast_head.description} />
            {noindex ? (
              <meta name="robots" content="noindex, nofollow" />
            ) : (
              <meta
                name="robots"
                content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
              />
            )}
            <link rel="canonical" href={link} />
            <meta property="og:locale" content={yoast_head.og_locale} />
            <meta property="og:type" content={yoast_head.article} />
            <meta property="og:title" content={yoast_head.og_title} />
            <meta
              property="og:description"
              content={yoast_head.og_description}
            />
            <meta property="og:url" content={link} />
            <meta property="og:site_name" content={yoast_head.og_site_name} />
            <meta
              property="article:published_time"
              content={yoast_head.article_published_time}
            />
            {yoast_head.og_image && yoast_head.og_image.length > 0 && (
              <>
                <meta
                  property="og:image"
                  content={yoast_head.og_image[0].url}
                />
                <meta
                  property="og:image:width"
                  content={yoast_head.og_image[0].width}
                />
                <meta
                  property="og:image:height"
                  content={yoast_head.og_image[0].height}
                />
                <meta
                  property="og:image:type"
                  content={yoast_head.og_image[0].type}
                />
              </>
            )}
            <meta name="author" content={yoast_head.editor} />
            <meta name="twitter:card" content={yoast_head.twitter_card} />
            <meta name="twitter:title" content={yoast_head.twitter_title} />
            <meta
              name="twitter:description"
              content={yoast_head.twitter_description}
            />
            <meta name="twitter:image" content={yoast_head.twitter_image} />
            <meta name="twitter:label1" content="Escrito por" />
            <meta name="twitter:data1" content={yoast_head.author} />
          </>
        ) : (
          <>
            <title>{title}</title>
            <meta name="author" content={author} />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords}></meta>
            {noindex ? (
              <meta name="robots" content="noindex, nofollow" />
            ) : (
              <meta
                name="robots"
                content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
              />
            )}
            <link rel="canonical" href={link} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={og_image} />
            <meta property="og:site_name" content={author} />
            <meta property="og:title" content={title} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={`https://${domain}`} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta property="twitter:domain" content={domain} />
            <meta property="twitter:url" content={`https://${domain}`} />
            <meta name="twitter:site" content={twitter} />
            <meta name="twitter:creator" content={twitter} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={og_image} />
          </>
        )}

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/assets/images/favicon/apple-touch-icon.png?v=0.1"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/assets/images/favicon/favicon-32x32.png?v=0.1"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/assets/images/favicon/favicon-16x16.png?v=0.1"
        />
        <link rel="manifest" href="/assets/images/favicon/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />

        {process.env.NEXT_PUBLIC_SYSTEM_SCOPE === 'production' && <GAScript />}
      </Head>
      <ToastContainer position="bottom-center" limit={1} />
    </>
  );
}
