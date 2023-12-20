import React from 'react';
import TopBar from '@/components/TopBar';
import SideBar from '@/components/SideBar';

import styles from '@/styles/Layout.module.css';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const TopBarClick = (ev) => {
    if (ev === 'toggle-sidebar') setSidebarOpen(!sidebarOpen);
  };
  return (
    <>
      <div className={`${styles.LayoutWrapper}`}>
        <TopBar onClickEvent={TopBarClick} />
        <div className={`${styles.centerWrapper}`}>
          <SideBar open={sidebarOpen} />
          <div className={`${styles.body}`}>{children}</div>
        </div>
      </div>
    </>
  );
}
