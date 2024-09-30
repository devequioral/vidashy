import React from 'react';
import TopBar from '@/components/TopBar';
import SideBar from '@/components/SideBar';
import styles from '@/styles/Layout.module.css';
import { useSession } from 'next-auth/react';
import AddCollection from './AddCollection/AddCollection';

export default function Layout({ children, theme }) {
  const { data: session } = useSession();
  const user = session?.user;
  return (
    <>
      <div className={`${styles.LayoutWrapper} ${styles[theme]}`}>
        <TopBar user={user} />
        <div className={`${styles.centerWrapper}`}>
          <SideBar />
          <div className={`${styles.body}`}>{children}</div>
        </div>
      </div>
      <AddCollection />
    </>
  );
}
