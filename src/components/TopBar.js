import React from 'react';
import styles from '@/styles/TopBar.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function TopBar({ address, onClickEvent }) {
  const router = useRouter();
  const [sidebarExpanded, setSidebarExpanded] = React.useState(true);

  const onClick = (ev) => {
    onClickEvent(ev);
    if (ev === 'toggle-sidebar') setSidebarExpanded(!sidebarExpanded);
  };

  const searchInput = React.useRef(null);
  const onSearch = () => {
    const search = searchInput.current.value;
    console.log(search);
  };
  return (
    <>
      <div
        className={`${styles.TopBar} ${!sidebarExpanded && styles.lessPadding}`}
      >
        <div className={`container-full ${styles.container}`}>
          <div className={`row ${styles.row}`}>
            <div className={`col-4 ${styles.colLeft}`}>
              <div
                className={`${styles.hamburguer}`}
                onClick={() => onClick('toggle-sidebar')}
              >
                <Image
                  src="/assets/images/hamburguer.png"
                  width={50}
                  height={36}
                  alt="Menu"
                />
              </div>
              <div className={`hide-xs hide-sm ${styles.logo}`}>
                <Link href="/">
                  <Image
                    src="/assets/images/logo.svg"
                    width={500}
                    height={500}
                    alt="Logo"
                  />
                </Link>
              </div>
            </div>
            <div className={`col-4 ${styles.colCenter}`}>
              <input
                className={`${styles.search}`}
                type="text"
                placeholder="Buscar"
                ref={searchInput}
                onKeyDown={(ev) => {
                  //IF KEY ENTER IS PRESSED
                  if (ev.key === 'Enter') {
                    onSearch();
                  }
                }}
              />
              <div className={`hide-xs hide-sm ${styles.cntBtn}`}>
                <div className={`${styles.icon}`} onClick={onSearch}>
                  <Image
                    src="/assets/images/search-icon.svg"
                    width={24}
                    height={24}
                    alt="Search Icon"
                  />
                </div>
                <div className={`hide-xs ${styles.icon}`}>
                  <div onClick={onSearch}>Buscar</div>
                </div>
              </div>
            </div>
            <div className={`col-4 ${styles.colRight}`}>
              <div className={`${styles.cntBtn}`}>
                <div className={`${styles.icon}`}>
                  <Link href="/app">
                    <Image
                      src="/assets/images/user-icon.svg"
                      width={24}
                      height={24}
                      alt="User Icon"
                    />
                  </Link>
                </div>
                <div className={`hide-xs ${styles.icon}`}>
                  <Link href="/app">Invitado</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
