import styles from '@/styles/SideBar.module.css';
import React from 'react';
import SideBarItemMenu from './SideBarItemMenu';

export default function SideBar({ open }) {
  const [expanded, setExpanded] = React.useState(false);
  const onClickMenu = (elem) => {
    const menu = elem.target.dataset.menu;
    console.log(menu, elem.target);
  };
  const onToggleMenu = (elem) => {
    if (elem.target.className !== styles.itemMenu) return;
    setExpanded(!expanded);
  };
  return (
    <>
      <div className={`${styles.SideBar} ${open === false && styles.collapse}`}>
        <ul className={`${styles.list}`}>
          <li>
            <SideBarItemMenu
              path="/app"
              icon={{
                src: '/assets/images/sidebar_house_icon.svg',
                width: 24,
                height: 24,
              }}
              label="Inicio"
              showLabel={open}
            ></SideBarItemMenu>
          </li>

          <li>
            <SideBarItemMenu
              path="/app/categories"
              icon={{
                src: '/assets/images/sidebar_category_icon.svg',
                width: 24,
                height: 24,
              }}
              label="Categorias"
              showLabel={open}
            >
              <li data-path="/app/categories/categoria-01">Categoria 01</li>
              <li data-path="/app/categories/categoria-02">Categoria 02</li>
              <li data-path="/app/categories/categoria-03">Categoria 03</li>
              <li data-path="/app/categories/categoria-04">Categoria 04</li>
            </SideBarItemMenu>
          </li>

          <li>
            <SideBarItemMenu
              path="/close-session"
              icon={{
                src: '/assets/images/sidebar_exit_icon.svg',
                width: 24,
                height: 24,
              }}
              label="Salir"
              showLabel={open}
            ></SideBarItemMenu>
          </li>
        </ul>
      </div>
    </>
  );
}
