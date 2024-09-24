import React, { useEffect, useRef, useState } from 'react';
import styles from './ContextualMenu.module.css';

export default function ContextualMenu({
  show,
  triggerElement,
  children,
  onClose,
  offsetTop = 30,
  offsetLeft = 0,
}) {
  const [menuVisible, setMenuVisible] = useState(show);
  const [top, setTop] = useState('0');
  const [left, setLeft] = useState('0');
  const refMenuContainer = useRef();

  useEffect(() => {
    if (triggerElement) {
      const bounding = triggerElement.getBoundingClientRect();
      setTop(`${bounding.y + offsetTop}px`);
      setLeft(`${bounding.x + offsetLeft}px`);
    }
    setMenuVisible(show);
  }, [show]);

  useEffect(() => {
    if (!menuVisible && onClose) onClose();
  }, [menuVisible]);

  const hideTabMenu = () => {
    setMenuVisible(false);
  };
  return (
    <div
      className={`${styles.ContextualMenu} ${menuVisible ? styles.show : ''}`}
      onClick={hideTabMenu}
      data-action="close-menu"
    >
      <div
        ref={refMenuContainer}
        className={`${styles.ContextualMenuContainer}`}
        style={{ top, left }}
      >
        {children}
      </div>
    </div>
  );
}
