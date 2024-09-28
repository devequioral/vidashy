import React, { useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/LayoutCollections.module.css';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  NavbarMenuToggle,
  NavbarMenu,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  Button,
} from '@nextui-org/react';
import { useSession } from 'next-auth/react';

export default function LayoutCollections({ collection, children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;
  const getUserName = () => {
    if (!user) return 'Invitado';
    let name = user.name || user.username;
    if (name.indexOf(' ') > -1) {
      name = name.split(' ');
      name = name[0];
    }
    return name;
  };
  return (
    <div className={styles.LayoutCollections}>
      <Navbar
        isBordered
        maxWidth="full"
        onMenuOpenChange={setIsMenuOpen}
        className={`${styles.Navbar}`}
        isBlurred={false}
      >
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="hide-md hide-lg hide-xl"
        />
        <NavbarBrand className={styles.NavBrand}>
          <Link href="/dashboard">
            <Image
              src={`/assets/images/theme-light/symbol-dark.svg`}
              width={85}
              height={70}
              alt="Logo"
              className={`${styles.logo}`}
            />
          </Link>
          {collection && (
            <span className={styles.NameCollection}>{collection.name}</span>
          )}
        </NavbarBrand>
        <NavbarContent as="div" justify="end" className="hide-xss">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="w-6 h-6 text-tiny avatar-topnav"
                name={getUserName()}
                size="sm"
                src="/assets/images/theme-light/icon-user.svg"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="welcome" className="h-14 gap-2">
                <p className="font-semibold">Welcome</p>
                <p className="font-semibold">{getUserName()}</p>
              </DropdownItem>
              <DropdownItem key="profile">
                <Link href="/dashboard/profile">Profile</Link>
              </DropdownItem>
              <DropdownItem key="orders">
                <Link href="/dashboard/organizations">My Organizations</Link>
              </DropdownItem>
              <DropdownItem key="logout" color="danger">
                <Link href="/close-session">Close Session</Link>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
        <NavbarMenu className={`${styles.NavbarMenu}`}>
          <div className={`${styles.MainNavigationCNT}`}></div>
        </NavbarMenu>
      </Navbar>
      {children}
    </div>
  );
}
