import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

function HomeScreen() {
  const router = useRouter();
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current === true) return;
    ref.current = true;
    router.push('/dashboard');
  }, [router]);
  return <></>;
}

HomeScreen.auth = true;
export default HomeScreen;
