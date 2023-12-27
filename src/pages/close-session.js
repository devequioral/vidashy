import Metaheader from '@/components/Metaheader';
import { signOut } from 'next-auth/react';
import React, { useEffect } from 'react';

export default function CloseSessionScreen() {
  const ref = React.useRef(null);
  useEffect(() => {
    if (ref.current === true) return;
    ref.current = true;
    signOut({ callbackUrl: '/login' });
  }, []);
  return (
    <>
      <Metaheader />
    </>
  );
}
