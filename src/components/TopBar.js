import React from 'react';
import styles from '@/styles/TopBar.module.css';
import Image from 'next/image';
//import Link from 'next/link';

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
} from '@nextui-org/react';
import TopBarNotifications from '@/components/TopBarNotifications';
import MainNavigation from '@/components/MainNavigation';

export default function TopBar(props) {
  const { user } = props;
  const getUserName = () => {
    if (!user) return 'Invitado';
    let name = user.name || user.username;
    if (name.indexOf(' ') > -1) {
      name = name.split(' ');
      name = name[0];
    }
    return name;
  };
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  return (
    <Navbar
      isBordered
      maxWidth="full"
      onMenuOpenChange={setIsMenuOpen}
      className={`${styles.Navbar}`}
    >
      <NavbarMenuToggle
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        className="hide-md hide-lg hide-xl"
      />
      <NavbarBrand>
        <Link href="/">
          <Image
            src={`/assets/images/theme-light/logo.svg`}
            width={429}
            height={79}
            alt="Logo"
            className={`${styles.logo}`}
          />
        </Link>
      </NavbarBrand>
      <NavbarContent as="div" justify="end" className="hide-xss">
        <NavbarItem className="flex justify-center items-center">
          <TopBarNotifications user={user} />
        </NavbarItem>
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
        <div className={`${styles.MainNavigationCNT}`}>
          <MainNavigation />
        </div>
      </NavbarMenu>
    </Navbar>
  );
}
