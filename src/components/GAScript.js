import { useEffect } from 'react';

export default function GAScript() {
  const trackingId = 'XXXX';
  useEffect(() => {
    window.gtag('config', trackingId);
  }, [trackingId]);

  return (
    <>
      {/* <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
      ></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${trackingId}');
        `,
        }}
      /> */}
    </>
  );
}
